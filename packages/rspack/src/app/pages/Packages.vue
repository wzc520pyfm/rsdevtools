<script setup lang="ts">
import { useRpc, formatBytes } from '@/composables/rpc'
import Fuse from 'fuse.js'
import { computed, onMounted, ref } from 'vue'

const props = defineProps<{ session: any; sessionId: string }>()
const { call } = useRpc()

const packages = ref<any[]>([])
const searchQuery = ref('')
const loading = ref(true)
const viewType = ref<'table' | 'treemap' | 'duplicates'>('table')
const sortBy = ref<'size' | 'name' | 'modules'>('size')
const sortOrder = ref<'asc' | 'desc'>('desc')
const filterType = ref<'all' | 'direct' | 'transitive'>('all')
const selectedPkg = ref<any>(null)

onMounted(async () => {
  try { packages.value = await call('rspack:get-packages', { session: props.sessionId }) } catch {}
  loading.value = false
})

const fuse = computed(() => new Fuse(packages.value, { keys: ['name'], threshold: 0.4, ignoreLocation: true }))

const filtered = computed(() => {
  let pkgs = packages.value
  if (viewType.value === 'duplicates') pkgs = pkgs.filter(p => p.isDuplicate)
  if (filterType.value === 'direct') pkgs = pkgs.filter(p => p.isDirect)
  if (filterType.value === 'transitive') pkgs = pkgs.filter(p => !p.isDirect)
  if (searchQuery.value) {
    const ids = new Set(fuse.value.search(searchQuery.value).map(r => r.item.name))
    pkgs = pkgs.filter(p => ids.has(p.name))
  }
  return [...pkgs].sort((a, b) => {
    const dir = sortOrder.value === 'asc' ? 1 : -1
    if (sortBy.value === 'size') return (a.size - b.size) * dir
    if (sortBy.value === 'name') return a.name.localeCompare(b.name) * dir
    return (a.moduleCount - b.moduleCount) * dir
  })
})

const duplicateCount = computed(() => packages.value.filter(p => p.isDuplicate).length)
const totalSize = computed(() => packages.value.reduce((s, p) => s + p.size, 0))
const treemapData = computed(() => filtered.value.map(p => ({ name: p.name, size: p.size, isDuplicate: p.isDuplicate })))
</script>

<template>
  <div class="h-full flex flex-col">
    <div class="p-4 border-b border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 space-y-3">
      <div class="flex items-center justify-between">
        <h1 class="text-xl font-bold flex items-center gap-2">
          <div class="i-carbon-package text-teal-500" />
          Packages
          <span class="badge-gray text-xs">{{ filtered.length }}</span>
          <span v-if="duplicateCount > 0" class="badge-yellow text-xs">{{ duplicateCount }} duplicate</span>
        </h1>
        <div class="text-sm text-gray-500">Total: <span class="font-mono font-medium">{{ formatBytes(totalSize) }}</span></div>
      </div>

      <div class="flex items-center gap-3 flex-wrap">
        <div class="relative flex-1 max-w-md">
          <div class="i-carbon-search absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
          <input v-model="searchQuery" class="input-base pl-9" placeholder="Search packages..." />
        </div>

        <div class="flex gap-1">
          <button v-for="v in (['table', 'treemap', 'duplicates'] as const)" :key="v"
            class="btn text-xs" :class="viewType === v ? 'bg-blue-100 dark:bg-blue-900 text-blue-700 dark:text-blue-300' : 'btn-ghost'"
            @click="viewType = v">
            {{ v === 'table' ? 'Table' : v === 'treemap' ? 'Treemap' : 'Duplicates' }}
          </button>
        </div>

        <div class="flex gap-1">
          <button v-for="f in (['all', 'direct', 'transitive'] as const)" :key="f"
            class="btn text-xs" :class="filterType === f ? 'bg-teal-100 dark:bg-teal-900 text-teal-700 dark:text-teal-300' : 'btn-ghost'"
            @click="filterType = f">
            {{ f }}
          </button>
        </div>
      </div>
    </div>

    <div v-if="loading" class="flex-1 flex items-center justify-center text-gray-400">
      <div class="i-carbon-renew animate-spin mr-2" /> Loading packages...
    </div>

    <!-- Treemap view -->
    <div v-else-if="viewType === 'treemap'" class="flex-1 overflow-auto p-4">
      <div class="flex flex-wrap gap-1" style="min-height: 400px">
        <div v-for="pkg in filtered" :key="pkg.name"
          class="rounded cursor-pointer flex items-center justify-center text-xs font-mono p-1 transition-all hover:opacity-80"
          :class="pkg.isDuplicate ? 'bg-yellow-200 dark:bg-yellow-800 text-yellow-900 dark:text-yellow-100' : 'bg-teal-200 dark:bg-teal-800 text-teal-900 dark:text-teal-100'"
          :style="{ width: `${Math.max(60, Math.sqrt(pkg.size / 100))}px`, height: `${Math.max(40, Math.sqrt(pkg.size / 150))}px` }"
          :title="`${pkg.name}: ${formatBytes(pkg.size)}`"
          @click="selectedPkg = selectedPkg?.name === pkg.name ? null : pkg">
          <span class="truncate">{{ pkg.name }}</span>
        </div>
      </div>
    </div>

    <!-- Table view -->
    <div v-else class="flex-1 overflow-auto">
      <table class="w-full text-sm">
        <thead class="sticky top-0 bg-gray-100 dark:bg-gray-900 z-10">
          <tr class="text-left text-xs text-gray-500 uppercase tracking-wide">
            <th class="px-4 py-2 cursor-pointer" @click="sortBy = 'name'; sortOrder = sortOrder === 'asc' ? 'desc' : 'asc'">Package</th>
            <th class="px-4 py-2 w-24 text-center">Type</th>
            <th class="px-4 py-2 w-24 text-right cursor-pointer" @click="sortBy = 'modules'; sortOrder = sortOrder === 'asc' ? 'desc' : 'asc'">Modules</th>
            <th class="px-4 py-2 w-28 text-right cursor-pointer" @click="sortBy = 'size'; sortOrder = sortOrder === 'asc' ? 'desc' : 'asc'">Size</th>
            <th class="px-4 py-2 w-24 text-center">Status</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="pkg in filtered" :key="pkg.name"
            class="border-b border-gray-100 dark:border-gray-800/50 hover:bg-teal-50/50 dark:hover:bg-teal-950/20 cursor-pointer transition-colors"
            :class="selectedPkg?.name === pkg.name ? 'bg-teal-50 dark:bg-teal-950/30' : ''"
            @click="selectedPkg = selectedPkg?.name === pkg.name ? null : pkg">
            <td class="px-4 py-2 font-mono text-sm">
              <div class="flex items-center gap-2">
                <div class="i-carbon-package text-teal-500" />
                {{ pkg.name }}
              </div>
            </td>
            <td class="px-4 py-2 text-center">
              <span :class="pkg.isDirect ? 'badge-blue' : 'badge-gray'" class="text-xs">
                {{ pkg.isDirect ? 'direct' : 'transitive' }}
              </span>
            </td>
            <td class="px-4 py-2 text-right font-mono text-xs">{{ pkg.moduleCount }}</td>
            <td class="px-4 py-2 text-right font-mono text-xs font-medium">{{ formatBytes(pkg.size) }}</td>
            <td class="px-4 py-2 text-center">
              <span v-if="pkg.isDuplicate" class="badge-yellow text-xs">
                {{ pkg.instances.length }} versions
              </span>
            </td>
          </tr>
        </tbody>
      </table>
    </div>

    <!-- Detail panel -->
    <Transition enter-active-class="transition-all duration-200" leave-active-class="transition-all duration-150"
      enter-from-class="translate-y-full opacity-0" leave-to-class="translate-y-full opacity-0">
      <div v-if="selectedPkg" class="border-t border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 p-4 max-h-60 overflow-auto">
        <div class="flex items-center justify-between mb-3">
          <h3 class="font-semibold text-sm flex items-center gap-2">
            <div class="i-carbon-package text-teal-500" /> {{ selectedPkg.name }}
          </h3>
          <button class="btn-ghost p-1" @click="selectedPkg = null"><div class="i-carbon-close" /></button>
        </div>
        <div class="grid grid-cols-3 gap-3 mb-3 text-sm">
          <div>
            <div class="text-xs text-gray-500">Size</div>
            <div class="font-mono font-medium">{{ formatBytes(selectedPkg.size) }}</div>
          </div>
          <div>
            <div class="text-xs text-gray-500">Modules</div>
            <div class="font-mono">{{ selectedPkg.moduleCount }}</div>
          </div>
          <div>
            <div class="text-xs text-gray-500">Type</div>
            <div>{{ selectedPkg.isDirect ? 'Direct' : 'Transitive' }}</div>
          </div>
        </div>
        <div v-if="selectedPkg.instances.length > 1" class="mb-3">
          <div class="text-xs text-gray-500 font-semibold mb-1">Duplicate Instances</div>
          <div v-for="inst in selectedPkg.instances" :key="inst.path" class="font-mono text-xs bg-yellow-50 dark:bg-yellow-950/30 px-2 py-1 rounded mb-1">
            {{ inst.path }} ({{ formatBytes(inst.size) }})
          </div>
        </div>
        <div v-if="selectedPkg.dependedBy.length > 0">
          <div class="text-xs text-gray-500 font-semibold mb-1">Depended By</div>
          <div class="flex flex-wrap gap-1">
            <span v-for="dep in selectedPkg.dependedBy" :key="dep" class="badge-gray text-xs font-mono">{{ dep }}</span>
          </div>
        </div>
      </div>
    </Transition>
  </div>
</template>
