<script setup lang="ts">
import { formatBytes, shortenPath } from '@/composables/rpc'
import Fuse from 'fuse.js'
import { computed, ref } from 'vue'

const props = defineProps<{
  session: any
  sessionId: string
}>()

const searchQuery = ref('')
const sortBy = ref<'size' | 'name' | 'depth'>('size')
const sortOrder = ref<'asc' | 'desc'>('desc')
const selectedModule = ref<any>(null)
const filterGroup = ref<string>('all')

const groups = computed(() => {
  const groupMap = new Map<string, number>()
  for (const m of props.session.modules) {
    const group = getGroup(m.name)
    groupMap.set(group, (groupMap.get(group) ?? 0) + 1)
  }
  return [{ name: 'all', count: props.session.modules.length }, ...Array.from(groupMap.entries()).map(([name, count]) => ({ name, count })).sort((a, b) => b.count - a.count)]
})

function getGroup(name: string): string {
  if (name.includes('node_modules')) return 'node_modules'
  const ext = name.split('.').pop() ?? ''
  if (['css', 'scss', 'less', 'styl'].includes(ext)) return 'styles'
  if (['vue', 'svelte', 'jsx', 'tsx'].includes(ext)) return 'components'
  if (['ts', 'js', 'mjs', 'cjs'].includes(ext)) return 'scripts'
  if (['json'].includes(ext)) return 'json'
  if (['png', 'jpg', 'jpeg', 'gif', 'svg', 'webp'].includes(ext)) return 'images'
  return 'other'
}

const fuse = computed(() => new Fuse(props.session.modules, {
  keys: ['name', 'id'],
  threshold: 0.4,
  ignoreLocation: true,
}))

const filteredModules = computed(() => {
  let modules = props.session.modules

  if (filterGroup.value !== 'all') {
    modules = modules.filter((m: any) => getGroup(m.name) === filterGroup.value)
  }

  if (searchQuery.value) {
    const results = fuse.value.search(searchQuery.value)
    modules = results.map(r => r.item)
    if (filterGroup.value !== 'all') {
      modules = modules.filter((m: any) => getGroup(m.name) === filterGroup.value)
    }
  }

  return [...modules].sort((a: any, b: any) => {
    const dir = sortOrder.value === 'asc' ? 1 : -1
    if (sortBy.value === 'size') return (a.size - b.size) * dir
    if (sortBy.value === 'name') return a.name.localeCompare(b.name) * dir
    return ((a.depth ?? 0) - (b.depth ?? 0)) * dir
  })
})

function toggleSort(key: 'size' | 'name' | 'depth') {
  if (sortBy.value === key) {
    sortOrder.value = sortOrder.value === 'asc' ? 'desc' : 'asc'
  } else {
    sortBy.value = key
    sortOrder.value = key === 'name' ? 'asc' : 'desc'
  }
}

const sortIcon = computed(() => sortOrder.value === 'asc' ? 'i-carbon-arrow-up' : 'i-carbon-arrow-down')
</script>

<template>
  <div class="h-full flex flex-col">
    <!-- Header -->
    <div class="p-4 border-b border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 space-y-3">
      <div class="flex items-center justify-between">
        <h1 class="text-xl font-bold flex items-center gap-2">
          <div class="i-carbon-document-multiple-01 text-green-500" />
          Modules
          <span class="badge-gray text-xs">{{ filteredModules.length }} / {{ session.modules.length }}</span>
        </h1>
      </div>

      <div class="flex items-center gap-3">
        <div class="relative flex-1 max-w-md">
          <div class="i-carbon-search absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
          <input
            v-model="searchQuery"
            class="input-base pl-9"
            placeholder="Search modules..."
          />
        </div>

        <div class="flex gap-1">
          <button
            v-for="g in groups"
            :key="g.name"
            class="btn text-xs"
            :class="filterGroup === g.name ? 'bg-blue-100 dark:bg-blue-900 text-blue-700 dark:text-blue-300' : 'btn-ghost'"
            @click="filterGroup = g.name"
          >
            {{ g.name }} ({{ g.count }})
          </button>
        </div>
      </div>
    </div>

    <!-- Table -->
    <div class="flex-1 overflow-auto">
      <table class="w-full text-sm">
        <thead class="sticky top-0 bg-gray-100 dark:bg-gray-900 z-10">
          <tr class="text-left text-xs text-gray-500 uppercase tracking-wide">
            <th class="px-4 py-2 cursor-pointer hover:text-gray-700 dark:hover:text-gray-300" @click="toggleSort('name')">
              <div class="flex items-center gap-1">
                Module
                <div v-if="sortBy === 'name'" :class="sortIcon" class="text-blue-500" />
              </div>
            </th>
            <th class="px-4 py-2 cursor-pointer hover:text-gray-700 dark:hover:text-gray-300 w-28 text-right" @click="toggleSort('size')">
              <div class="flex items-center gap-1 justify-end">
                Size
                <div v-if="sortBy === 'size'" :class="sortIcon" class="text-blue-500" />
              </div>
            </th>
            <th class="px-4 py-2 w-20 text-right">Chunks</th>
            <th class="px-4 py-2 cursor-pointer hover:text-gray-700 dark:hover:text-gray-300 w-20 text-right" @click="toggleSort('depth')">
              <div class="flex items-center gap-1 justify-end">
                Depth
                <div v-if="sortBy === 'depth'" :class="sortIcon" class="text-blue-500" />
              </div>
            </th>
            <th class="px-4 py-2 w-24 text-right">Type</th>
          </tr>
        </thead>
        <tbody>
          <tr
            v-for="mod in filteredModules"
            :key="mod.id"
            class="border-b border-gray-100 dark:border-gray-800/50 hover:bg-blue-50/50 dark:hover:bg-blue-950/30 cursor-pointer transition-colors"
            :class="selectedModule?.id === mod.id ? 'bg-blue-50 dark:bg-blue-950/50' : ''"
            @click="selectedModule = selectedModule?.id === mod.id ? null : mod"
          >
            <td class="px-4 py-2">
              <div class="font-mono text-xs truncate max-w-lg" :title="mod.name">
                {{ shortenPath(mod.name) }}
              </div>
            </td>
            <td class="px-4 py-2 text-right font-mono text-xs">
              {{ formatBytes(mod.size) }}
            </td>
            <td class="px-4 py-2 text-right text-xs">
              {{ mod.chunks.length }}
            </td>
            <td class="px-4 py-2 text-right text-xs">
              {{ mod.depth ?? '-' }}
            </td>
            <td class="px-4 py-2 text-right">
              <span class="badge-gray text-xs font-mono">{{ mod.moduleType || mod.type || '-' }}</span>
            </td>
          </tr>
        </tbody>
      </table>
    </div>

    <!-- Module Detail Panel -->
    <Transition
      enter-active-class="transition-all duration-200 ease-out"
      leave-active-class="transition-all duration-150 ease-in"
      enter-from-class="translate-y-full opacity-0"
      leave-to-class="translate-y-full opacity-0"
    >
      <div
        v-if="selectedModule"
        class="border-t border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 p-4 max-h-80 overflow-auto"
      >
        <div class="flex items-center justify-between mb-3">
          <h3 class="font-semibold text-sm">Module Details</h3>
          <button class="btn-ghost p-1" @click="selectedModule = null">
            <div class="i-carbon-close" />
          </button>
        </div>

        <div class="grid grid-cols-2 lg:grid-cols-4 gap-3 mb-4">
          <div>
            <div class="text-xs text-gray-500 mb-1">Size</div>
            <div class="font-mono text-sm font-medium">{{ formatBytes(selectedModule.size) }}</div>
          </div>
          <div>
            <div class="text-xs text-gray-500 mb-1">Type</div>
            <div class="font-mono text-sm">{{ selectedModule.moduleType || '-' }}</div>
          </div>
          <div>
            <div class="text-xs text-gray-500 mb-1">Depth</div>
            <div class="font-mono text-sm">{{ selectedModule.depth ?? '-' }}</div>
          </div>
          <div>
            <div class="text-xs text-gray-500 mb-1">Chunks</div>
            <div class="font-mono text-sm">{{ selectedModule.chunks.length }}</div>
          </div>
        </div>

        <div class="mb-3">
          <div class="text-xs text-gray-500 mb-1">Full Path</div>
          <div class="font-mono text-xs bg-gray-50 dark:bg-gray-800 p-2 rounded break-all">{{ selectedModule.name }}</div>
        </div>

        <div v-if="selectedModule.issuer" class="mb-3">
          <div class="text-xs text-gray-500 mb-1">Issuer</div>
          <div class="font-mono text-xs bg-gray-50 dark:bg-gray-800 p-2 rounded break-all">{{ selectedModule.issuer }}</div>
        </div>

        <div v-if="selectedModule.dependents.length > 0" class="mb-3">
          <div class="text-xs text-gray-500 mb-1">Imported By ({{ selectedModule.dependents.length }})</div>
          <div class="max-h-32 overflow-auto space-y-1">
            <div
              v-for="dep in selectedModule.dependents.slice(0, 20)"
              :key="dep"
              class="font-mono text-xs text-gray-600 dark:text-gray-400 truncate"
            >
              {{ shortenPath(dep) }}
            </div>
            <div v-if="selectedModule.dependents.length > 20" class="text-xs text-gray-400">
              ... and {{ selectedModule.dependents.length - 20 }} more
            </div>
          </div>
        </div>
      </div>
    </Transition>
  </div>
</template>
