<script setup lang="ts">
import { formatBytes, getFileIcon, useRpc } from '@/composables/rpc'
import Fuse from 'fuse.js'
import { computed, ref } from 'vue'

const props = defineProps<{ session: any; sessionId: string }>()
const { call } = useRpc()

const searchQuery = ref('')
const viewType = ref<'list' | 'folder' | 'treemap' | 'sunburst' | 'flamegraph'>('list')
const sortBy = ref<'size' | 'name'>('size')
const sortOrder = ref<'asc' | 'desc'>('desc')
const selectedAsset = ref<any>(null)

const fuse = computed(() => new Fuse(props.session?.assets ?? [], { keys: ['name'], threshold: 0.4, ignoreLocation: true }))

const filteredAssets = computed(() => {
  let assets = props.session?.assets ?? []
  if (searchQuery.value) assets = fuse.value.search(searchQuery.value).map(r => r.item)
  return [...assets].sort((a: any, b: any) => {
    const dir = sortOrder.value === 'asc' ? 1 : -1
    return sortBy.value === 'size' ? (a.size - b.size) * dir : a.name.localeCompare(b.name) * dir
  })
})

const totalSize = computed(() => filteredAssets.value.reduce((s: number, a: any) => s + a.size, 0))
const maxSize = computed(() => Math.max(...filteredAssets.value.map((a: any) => a.size), 1))

const folderTree = computed(() => {
  const tree: Record<string, any[]> = {}
  for (const asset of filteredAssets.value) {
    const parts = asset.name.split('/')
    const folder = parts.length > 1 ? parts.slice(0, -1).join('/') : '.'
    if (!tree[folder]) tree[folder] = []
    tree[folder].push(asset)
  }
  return Object.entries(tree).sort(([a], [b]) => a.localeCompare(b))
})

const flamegraphRows = computed(() =>
  [...filteredAssets.value].sort((a: any, b: any) => b.size - a.size).map((a: any) => ({
    name: a.name, size: a.size, percent: (a.size / totalSize.value * 100).toFixed(1),
  }))
)

function getFileType(name: string): string {
  const ext = name.split('.').pop() ?? ''
  if (['js', 'mjs', 'cjs'].includes(ext)) return 'javascript'
  if (['css', 'scss', 'less'].includes(ext)) return 'stylesheet'
  if (['png', 'jpg', 'jpeg', 'gif', 'svg', 'webp'].includes(ext)) return 'image'
  if (['woff', 'woff2', 'ttf', 'eot'].includes(ext)) return 'font'
  if (ext === 'map') return 'sourcemap'
  return 'other'
}

const typeColors: Record<string, string> = {
  javascript: '#eab308', stylesheet: '#3b82f6', image: '#22c55e', font: '#8b5cf6', sourcemap: '#9ca3af', other: '#6b7280',
}

function openInFinder(path: string) {
  call('rspack:open-in-finder', { path }).catch(() => {})
}
</script>

<template>
  <div class="h-full flex flex-col">
    <div class="p-4 border-b border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 space-y-3">
      <div class="flex items-center justify-between">
        <h1 class="text-xl font-bold flex items-center gap-2">
          <div class="i-carbon-folder text-orange-500" /> Assets <span class="badge-gray text-xs">{{ filteredAssets.length }}</span>
        </h1>
        <div class="text-sm text-gray-500">Total: <span class="font-mono font-medium">{{ formatBytes(totalSize) }}</span></div>
      </div>
      <div class="flex items-center gap-3">
        <div class="relative flex-1 max-w-md">
          <div class="i-carbon-search absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
          <input v-model="searchQuery" class="input-base pl-9" placeholder="Search assets..." />
        </div>
        <div class="flex gap-1">
          <button v-for="v in (['list', 'folder', 'treemap', 'sunburst', 'flamegraph'] as const)" :key="v"
            class="btn text-xs" :class="viewType === v ? 'bg-orange-100 dark:bg-orange-900 text-orange-700 dark:text-orange-300' : 'btn-ghost'"
            @click="viewType = v">{{ v[0].toUpperCase() + v.slice(1) }}</button>
        </div>
      </div>
    </div>

    <!-- Treemap -->
    <div v-if="viewType === 'treemap'" class="flex-1 overflow-auto p-4">
      <div class="flex flex-wrap gap-1" style="min-height: 400px">
        <div v-for="asset in filteredAssets" :key="asset.name"
          class="rounded cursor-pointer flex items-end p-1.5 text-xs font-mono transition-all hover:opacity-80"
          :style="{ width: `${Math.max(80, Math.sqrt(asset.size / 50))}px`, height: `${Math.max(50, Math.sqrt(asset.size / 80))}px`, backgroundColor: (typeColors[getFileType(asset.name)] ?? '#6b7280') + '33', color: typeColors[getFileType(asset.name)] ?? '#6b7280' }"
          :title="`${asset.name}: ${formatBytes(asset.size)}`"
          @click="selectedAsset = selectedAsset?.name === asset.name ? null : asset">
          <span class="truncate">{{ asset.name.split('/').pop() }}</span>
        </div>
      </div>
    </div>

    <!-- Sunburst -->
    <div v-else-if="viewType === 'sunburst'" class="flex-1 overflow-auto p-8 flex items-center justify-center">
      <div class="relative" style="width: 400px; height: 400px;">
        <svg viewBox="0 0 400 400" class="w-full h-full">
          <circle cx="200" cy="200" r="60" fill="#f3f4f6" stroke="#e5e7eb" stroke-width="1" />
          <text x="200" y="195" text-anchor="middle" class="text-xs font-medium" fill="#374151">Assets</text>
          <text x="200" y="212" text-anchor="middle" class="text-xs font-mono" fill="#6b7280">{{ formatBytes(totalSize) }}</text>
          <g v-for="(asset, i) in filteredAssets" :key="asset.name">
            <path
              :d="(() => {
                let startAngle = filteredAssets.slice(0, i).reduce((s, a) => s + a.size / totalSize * Math.PI * 2, 0) - Math.PI / 2
                const angle = asset.size / totalSize * Math.PI * 2
                const r1 = 70, r2 = 160
                const x1 = 200 + r1 * Math.cos(startAngle), y1 = 200 + r1 * Math.sin(startAngle)
                const x2 = 200 + r2 * Math.cos(startAngle), y2 = 200 + r2 * Math.sin(startAngle)
                const x3 = 200 + r2 * Math.cos(startAngle + angle), y3 = 200 + r2 * Math.sin(startAngle + angle)
                const x4 = 200 + r1 * Math.cos(startAngle + angle), y4 = 200 + r1 * Math.sin(startAngle + angle)
                const large = angle > Math.PI ? 1 : 0
                return `M${x1},${y1} L${x2},${y2} A${r2},${r2} 0 ${large} 1 ${x3},${y3} L${x4},${y4} A${r1},${r1} 0 ${large} 0 ${x1},${y1}`
              })()"
              :fill="typeColors[getFileType(asset.name)] ?? '#6b7280'" fill-opacity="0.6"
              stroke="white" stroke-width="2" class="cursor-pointer hover:fill-opacity-90 transition-all"
            >
              <title>{{ asset.name }}: {{ formatBytes(asset.size) }}</title>
            </path>
          </g>
        </svg>
      </div>
      <div class="ml-8 space-y-2">
        <div v-for="(color, type) in typeColors" :key="type" class="flex items-center gap-2 text-sm">
          <div class="w-3 h-3 rounded" :style="{ backgroundColor: color }" />
          <span>{{ type }}</span>
        </div>
      </div>
    </div>

    <!-- Flamegraph -->
    <div v-else-if="viewType === 'flamegraph'" class="flex-1 overflow-auto p-4 space-y-1">
      <div class="text-xs text-gray-500 mb-2 uppercase tracking-wide font-semibold">Asset Size Distribution</div>
      <div v-for="row in flamegraphRows" :key="row.name" class="flex items-center gap-2">
        <div class="flex-1 h-8 rounded overflow-hidden relative cursor-pointer"
          :style="{ maxWidth: `${Math.max(10, row.size / maxSize * 100)}%` }">
          <div class="absolute inset-0" :style="{ background: `linear-gradient(to right, ${typeColors[getFileType(row.name)] ?? '#6b7280'}88, ${typeColors[getFileType(row.name)] ?? '#6b7280'})` }" />
          <div class="absolute inset-0 flex items-center px-2 text-xs font-mono text-white font-medium truncate">
            {{ row.name.split('/').pop() }}
          </div>
        </div>
        <span class="font-mono text-xs text-gray-500 w-20 text-right shrink-0">{{ formatBytes(row.size) }}</span>
        <span class="text-xs text-gray-400 w-12 text-right shrink-0">{{ row.percent }}%</span>
      </div>
    </div>

    <!-- Folder view -->
    <div v-else-if="viewType === 'folder'" class="flex-1 overflow-auto p-4 space-y-4">
      <div v-for="[folder, assets] in folderTree" :key="folder">
        <div class="flex items-center gap-2 mb-2 text-sm font-medium text-gray-600 dark:text-gray-400">
          <div class="i-carbon-folder text-orange-400" /> {{ folder }} <span class="text-xs text-gray-400">({{ assets.length }})</span>
        </div>
        <div class="ml-4 space-y-1">
          <div v-for="asset in assets" :key="asset.name"
            class="flex items-center gap-2 py-1 text-sm hover:bg-orange-50/50 dark:hover:bg-orange-950/20 rounded px-2 cursor-pointer"
            @click="selectedAsset = selectedAsset?.name === asset.name ? null : asset">
            <div :class="getFileIcon(asset.name)" />
            <span class="font-mono text-xs flex-1">{{ asset.name.split('/').pop() }}</span>
            <span class="font-mono text-xs text-gray-500">{{ formatBytes(asset.size) }}</span>
          </div>
        </div>
      </div>
    </div>

    <!-- List view -->
    <div v-else class="flex-1 overflow-auto">
      <table class="w-full text-sm">
        <thead class="sticky top-0 bg-gray-100 dark:bg-gray-900 z-10">
          <tr class="text-left text-xs text-gray-500 uppercase tracking-wide">
            <th class="px-4 py-2">Asset</th><th class="px-4 py-2 w-40 text-right">Size</th><th class="px-4 py-2 w-24 text-right">Chunks</th><th class="px-4 py-2 w-24 text-center">Emitted</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="asset in filteredAssets" :key="asset.name"
            class="border-b border-gray-100 dark:border-gray-800/50 hover:bg-orange-50/50 dark:hover:bg-orange-950/20 transition-colors cursor-pointer"
            @click="selectedAsset = selectedAsset?.name === asset.name ? null : asset">
            <td class="px-4 py-3"><div class="flex items-center gap-2"><div :class="getFileIcon(asset.name)" /><span class="font-mono text-xs">{{ asset.name }}</span></div></td>
            <td class="px-4 py-3 text-right">
              <div class="flex items-center justify-end gap-2">
                <div class="w-20 h-1.5 bg-gray-100 dark:bg-gray-800 rounded-full overflow-hidden">
                  <div class="h-full bg-orange-400 rounded-full" :style="{ width: `${Math.max(2, (asset.size / maxSize) * 100)}%` }" />
                </div>
                <span class="font-mono text-xs font-medium w-20 text-right">{{ formatBytes(asset.size) }}</span>
              </div>
            </td>
            <td class="px-4 py-3 text-right text-xs text-gray-500">{{ asset.chunks.length }}</td>
            <td class="px-4 py-3 text-center"><div :class="asset.emitted ? 'i-carbon-checkmark-filled text-green-500' : 'i-carbon-close text-gray-300'" /></td>
          </tr>
        </tbody>
      </table>
    </div>

    <!-- Detail panel -->
    <Transition enter-active-class="transition-all duration-200" leave-active-class="transition-all duration-150"
      enter-from-class="translate-y-full opacity-0" leave-to-class="translate-y-full opacity-0">
      <div v-if="selectedAsset" class="border-t border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 p-4 max-h-60 overflow-auto">
        <div class="flex items-center justify-between mb-3">
          <h3 class="font-semibold text-sm flex items-center gap-2"><div :class="getFileIcon(selectedAsset.name)" /> {{ selectedAsset.name }}</h3>
          <div class="flex items-center gap-1">
            <button class="btn-ghost p-1 text-xs" @click="openInFinder(selectedAsset.name)" title="Open in Finder"><div class="i-carbon-folder" /></button>
            <button class="btn-ghost p-1" @click="selectedAsset = null"><div class="i-carbon-close" /></button>
          </div>
        </div>
        <div class="grid grid-cols-3 gap-3 text-sm mb-3">
          <div><div class="text-xs text-gray-500">Size</div><div class="font-mono font-medium">{{ formatBytes(selectedAsset.size) }}</div></div>
          <div><div class="text-xs text-gray-500">Chunks</div><div class="font-mono">{{ selectedAsset.chunks.join(', ') }}</div></div>
          <div><div class="text-xs text-gray-500">Emitted</div><div>{{ selectedAsset.emitted ? 'Yes' : 'No' }}</div></div>
        </div>
        <div v-if="selectedAsset.relatedModules?.length > 0">
          <div class="text-xs text-gray-500 font-semibold mb-1">Related Modules ({{ selectedAsset.relatedModules.length }})</div>
          <div class="max-h-24 overflow-auto space-y-0.5">
            <div v-for="mod in selectedAsset.relatedModules.slice(0, 15)" :key="mod" class="font-mono text-xs text-gray-500 truncate">{{ mod }}</div>
            <div v-if="selectedAsset.relatedModules.length > 15" class="text-xs text-gray-400">... and {{ selectedAsset.relatedModules.length - 15 }} more</div>
          </div>
        </div>
      </div>
    </Transition>
  </div>
</template>
