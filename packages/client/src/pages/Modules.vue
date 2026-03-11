<script setup lang="ts">
import { formatBytes, getFileIcon, shortenPath, useRpc } from '@/composables/rpc'
import Fuse from 'fuse.js'
import { computed, onMounted, ref } from 'vue'

const props = defineProps<{ session: any; sessionId: string }>()
const { call } = useRpc()

const modules = ref<any[]>([])
const searchQuery = ref('')
const loading = ref(true)
const selectedModule = ref<any>(null)
const detailTab = ref<'info' | 'deps' | 'code'>('info')
const groupFilter = ref('all')
const sortBy = ref<'size' | 'name' | 'depth'>('size')
const sortOrder = ref<'asc' | 'desc'>('desc')

onMounted(async () => {
  try { modules.value = await call('rspack:get-modules', { session: props.sessionId }) } catch {}
  loading.value = false
})

const fuse = computed(() => new Fuse(modules.value, { keys: ['name'], threshold: 0.4, ignoreLocation: true }))

const groups = computed(() => {
  const gm = new Map<string, number>()
  for (const m of modules.value) {
    const g = getGroup(m.name)
    gm.set(g, (gm.get(g) ?? 0) + 1)
  }
  return [{ name: 'all', count: modules.value.length }, ...Array.from(gm.entries()).map(([name, count]) => ({ name, count })).sort((a, b) => b.count - a.count)]
})

const filteredModules = computed(() => {
  let mods = modules.value
  if (groupFilter.value !== 'all') mods = mods.filter(m => getGroup(m.name) === groupFilter.value)
  if (searchQuery.value) {
    const ids = new Set(fuse.value.search(searchQuery.value).map(r => r.item.id))
    mods = mods.filter(m => ids.has(m.id))
  }
  return [...mods].sort((a, b) => {
    const dir = sortOrder.value === 'asc' ? 1 : -1
    if (sortBy.value === 'size') return (a.size - b.size) * dir
    if (sortBy.value === 'name') return a.name.localeCompare(b.name) * dir
    return ((a.depth ?? 0) - (b.depth ?? 0)) * dir
  })
})

const maxSize = computed(() => Math.max(...filteredModules.value.map(m => m.size), 1))

function getGroup(name: string): string {
  if (name.includes('node_modules')) return 'node_modules'
  if (/\.(css|scss|less|styl)$/.test(name)) return 'styles'
  if (/\.(ts|tsx)$/.test(name)) return 'typescript'
  if (/\.(js|jsx|mjs|cjs)$/.test(name)) return 'javascript'
  if (/\.(vue|svelte)$/.test(name)) return 'components'
  if (/\.json$/.test(name)) return 'json'
  if (/\.(png|jpe?g|gif|svg|webp|ico)$/.test(name)) return 'images'
  return 'other'
}

function toggleSort(key: typeof sortBy.value) {
  if (sortBy.value === key) sortOrder.value = sortOrder.value === 'asc' ? 'desc' : 'asc'
  else { sortBy.value = key; sortOrder.value = key === 'name' ? 'asc' : 'desc' }
}

function selectModule(mod: any) {
  selectedModule.value = selectedModule.value?.id === mod.id ? null : mod
  detailTab.value = 'info'
}

function openInEditor(path: string) {
  call('rspack:open-in-editor', { path }).catch(() => {})
}
</script>

<template>
  <div class="h-full flex flex-col">
    <div class="p-4 border-b border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 space-y-3">
      <div class="flex items-center justify-between">
        <h1 class="text-xl font-bold flex items-center gap-2">
          <div class="i-carbon-document-multiple-01 text-green-500" /> Modules
          <span class="badge-gray text-xs">{{ filteredModules.length }}</span>
        </h1>
      </div>
      <div class="flex items-center gap-3">
        <div class="relative flex-1 max-w-md">
          <div class="i-carbon-search absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
          <input v-model="searchQuery" class="input-base pl-9" placeholder="Search modules..." />
        </div>
      </div>
      <div class="flex gap-1 flex-wrap">
        <button v-for="g in groups" :key="g.name"
          class="btn text-xs" :class="groupFilter === g.name ? 'bg-green-100 dark:bg-green-900 text-green-700 dark:text-green-300' : 'btn-ghost'"
          @click="groupFilter = g.name">
          {{ g.name }} <span class="opacity-60">({{ g.count }})</span>
        </button>
      </div>
    </div>

    <div v-if="loading" class="flex-1 flex items-center justify-center text-gray-400">
      <div class="i-carbon-renew animate-spin mr-2" /> Loading modules...
    </div>

    <div v-else class="flex-1 flex overflow-hidden">
      <div class="flex-1 overflow-auto">
        <table class="w-full text-sm">
          <thead class="sticky top-0 bg-gray-100 dark:bg-gray-900 z-10">
            <tr class="text-left text-xs text-gray-500 uppercase tracking-wide">
              <th class="px-4 py-2 cursor-pointer" @click="toggleSort('name')">Module</th>
              <th class="px-4 py-2 w-16 text-center cursor-pointer" @click="toggleSort('depth')">Depth</th>
              <th class="px-4 py-2 w-40 text-right cursor-pointer" @click="toggleSort('size')">Size</th>
              <th class="px-4 py-2 w-16 text-center">Actions</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="mod in filteredModules" :key="mod.id"
              class="border-b border-gray-100 dark:border-gray-800/50 hover:bg-green-50/50 dark:hover:bg-green-950/20 cursor-pointer transition-colors"
              :class="selectedModule?.id === mod.id ? 'bg-green-50 dark:bg-green-950/30' : ''"
              @click="selectModule(mod)">
              <td class="px-4 py-2">
                <div class="flex items-center gap-2">
                  <div :class="getFileIcon(mod.name)" class="shrink-0" />
                  <span class="font-mono text-xs truncate max-w-lg" :title="mod.name">{{ shortenPath(mod.name) }}</span>
                </div>
              </td>
              <td class="px-4 py-2 text-center text-xs text-gray-400">{{ mod.depth ?? '-' }}</td>
              <td class="px-4 py-2 text-right">
                <div class="flex items-center justify-end gap-2">
                  <div class="w-20 h-1.5 bg-gray-100 dark:bg-gray-800 rounded-full overflow-hidden">
                    <div class="h-full bg-green-400 rounded-full" :style="{ width: `${Math.max(2, (mod.size / maxSize) * 100)}%` }" />
                  </div>
                  <span class="font-mono text-xs font-medium w-16 text-right">{{ formatBytes(mod.size) }}</span>
                </div>
              </td>
              <td class="px-4 py-2 text-center">
                <button class="btn-ghost p-1 text-xs" @click.stop="openInEditor(mod.name)" title="Open in editor">
                  <div class="i-carbon-launch" />
                </button>
              </td>
            </tr>
          </tbody>
        </table>
      </div>

      <!-- Detail panel -->
      <Transition enter-active-class="transition-all duration-200" leave-active-class="transition-all duration-150"
        enter-from-class="translate-x-full" leave-to-class="translate-x-full">
        <div v-if="selectedModule" class="w-80 border-l border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 overflow-auto">
          <div class="p-4 border-b border-gray-200 dark:border-gray-800 sticky top-0 bg-white dark:bg-gray-900 z-10">
            <div class="flex items-center justify-between mb-2">
              <h3 class="font-semibold text-sm truncate flex-1" :title="selectedModule.name">{{ shortenPath(selectedModule.name) }}</h3>
              <button class="btn-ghost p-1 shrink-0" @click="selectedModule = null"><div class="i-carbon-close" /></button>
            </div>
            <div class="flex gap-1">
              <button v-for="tab in ['info', 'deps', 'code'] as const" :key="tab"
                class="btn text-xs" :class="detailTab === tab ? 'bg-green-100 dark:bg-green-900 text-green-700 dark:text-green-300' : 'btn-ghost'"
                @click="detailTab = tab">{{ tab }}</button>
            </div>
          </div>

          <div class="p-4">
            <template v-if="detailTab === 'info'">
              <div class="grid grid-cols-2 gap-3 text-sm mb-4">
                <div><div class="text-xs text-gray-500">Size</div><div class="font-mono font-medium">{{ formatBytes(selectedModule.size) }}</div></div>
                <div><div class="text-xs text-gray-500">Type</div><div class="font-mono text-xs">{{ selectedModule.moduleType }}</div></div>
                <div><div class="text-xs text-gray-500">Depth</div><div class="font-mono">{{ selectedModule.depth ?? '-' }}</div></div>
                <div><div class="text-xs text-gray-500">Chunks</div><div class="font-mono text-xs">{{ selectedModule.chunks.join(', ') }}</div></div>
              </div>
              <div v-if="selectedModule.issuer" class="mb-4">
                <div class="text-xs text-gray-500 font-semibold mb-1">Issuer</div>
                <div class="font-mono text-xs text-gray-600 dark:text-gray-400 truncate">{{ shortenPath(selectedModule.issuer) }}</div>
              </div>
              <div class="flex gap-2">
                <button class="btn-ghost text-xs flex-1" @click="openInEditor(selectedModule.name)">
                  <div class="i-carbon-launch mr-1" /> Open in Editor
                </button>
              </div>
            </template>

            <template v-if="detailTab === 'deps'">
              <div v-if="selectedModule.dependencies?.length" class="mb-4">
                <div class="text-xs text-gray-500 font-semibold mb-2">Dependencies ({{ selectedModule.dependencies.length }})</div>
                <div class="max-h-40 overflow-auto space-y-1">
                  <div v-for="dep in selectedModule.dependencies" :key="dep" class="font-mono text-xs text-gray-600 dark:text-gray-400 truncate hover:text-green-600 cursor-pointer"
                    @click="selectModule(modules.find(m => m.id === dep))">
                    {{ shortenPath(dep) }}
                  </div>
                </div>
              </div>
              <div v-if="selectedModule.dependents?.length" class="mb-4">
                <div class="text-xs text-gray-500 font-semibold mb-2">Dependents ({{ selectedModule.dependents.length }})</div>
                <div class="max-h-40 overflow-auto space-y-1">
                  <div v-for="dep in selectedModule.dependents" :key="dep" class="font-mono text-xs text-gray-600 dark:text-gray-400 truncate hover:text-green-600 cursor-pointer"
                    @click="selectModule(modules.find(m => m.id === dep))">
                    {{ shortenPath(dep) }}
                  </div>
                </div>
              </div>
              <div v-if="selectedModule.reasons?.length" class="mb-4">
                <div class="text-xs text-gray-500 font-semibold mb-2">Import Reasons ({{ selectedModule.reasons.length }})</div>
                <div class="max-h-40 overflow-auto space-y-1">
                  <div v-for="r in selectedModule.reasons" :key="r.moduleId" class="text-xs text-gray-500">
                    <span class="badge-gray text-xs">{{ r.type }}</span>
                    <span class="font-mono ml-1">{{ r.userRequest }}</span>
                  </div>
                </div>
              </div>
            </template>

            <template v-if="detailTab === 'code'">
              <div v-if="selectedModule.source" class="bg-gray-950 rounded-lg p-3 overflow-auto max-h-80">
                <pre class="text-xs font-mono text-green-400 whitespace-pre-wrap">{{ selectedModule.source }}</pre>
              </div>
              <div v-else class="text-center text-gray-400 py-8">
                <div class="i-carbon-code text-2xl mb-2" />
                <p class="text-sm">Source not available</p>
              </div>
            </template>
          </div>
        </div>
      </Transition>
    </div>
  </div>
</template>
