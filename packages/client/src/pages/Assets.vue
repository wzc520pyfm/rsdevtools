<script setup lang="ts">
import { formatBytes } from '@/composables/rpc'
import Fuse from 'fuse.js'
import { computed, ref } from 'vue'

const props = defineProps<{
  session: any
  sessionId: string
}>()

const searchQuery = ref('')
const viewType = ref<'list' | 'treemap'>('list')
const sortBy = ref<'size' | 'name'>('size')
const sortOrder = ref<'asc' | 'desc'>('desc')

const fuse = computed(() => new Fuse(props.session?.assets ?? [], {
  keys: ['name'],
  threshold: 0.4,
  ignoreLocation: true,
}))

const filteredAssets = computed(() => {
  let assets = props.session?.assets ?? []

  if (searchQuery.value) {
    assets = fuse.value.search(searchQuery.value).map(r => r.item)
  }

  return [...assets].sort((a: any, b: any) => {
    const dir = sortOrder.value === 'asc' ? 1 : -1
    if (sortBy.value === 'size') return (a.size - b.size) * dir
    return a.name.localeCompare(b.name) * dir
  })
})

const totalSize = computed(() => {
  return filteredAssets.value.reduce((sum: number, a: any) => sum + a.size, 0)
})

function getFileIcon(name: string): string {
  if (/\.js$/.test(name)) return 'i-carbon-logo-javascript text-yellow-500'
  if (/\.css$/.test(name)) return 'i-carbon-color-palette text-blue-500'
  if (/\.html$/.test(name)) return 'i-carbon-html text-orange-500'
  if (/\.(png|jpe?g|gif|svg|webp|ico)$/.test(name)) return 'i-carbon-image text-green-500'
  if (/\.(woff2?|ttf|eot)$/.test(name)) return 'i-carbon-text-font text-purple-500'
  if (/\.map$/.test(name)) return 'i-carbon-map text-gray-400'
  return 'i-carbon-document text-gray-500'
}

function toggleSort(key: 'size' | 'name') {
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
    <div class="p-4 border-b border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900">
      <div class="flex items-center justify-between mb-3">
        <h1 class="text-xl font-bold flex items-center gap-2">
          <div class="i-carbon-folder text-orange-500" />
          Assets
          <span class="badge-gray text-xs">{{ filteredAssets.length }}</span>
        </h1>
        <div class="text-sm text-gray-500">
          Total: <span class="font-mono font-medium">{{ formatBytes(totalSize) }}</span>
        </div>
      </div>

      <div class="flex items-center gap-3">
        <div class="relative flex-1 max-w-md">
          <div class="i-carbon-search absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
          <input
            v-model="searchQuery"
            class="input-base pl-9"
            placeholder="Search assets..."
          />
        </div>
      </div>
    </div>

    <div class="flex-1 overflow-auto">
      <table class="w-full text-sm">
        <thead class="sticky top-0 bg-gray-100 dark:bg-gray-900 z-10">
          <tr class="text-left text-xs text-gray-500 uppercase tracking-wide">
            <th class="px-4 py-2 cursor-pointer hover:text-gray-700 dark:hover:text-gray-300" @click="toggleSort('name')">
              <div class="flex items-center gap-1">
                Asset
                <div v-if="sortBy === 'name'" :class="sortIcon" class="text-blue-500" />
              </div>
            </th>
            <th class="px-4 py-2 cursor-pointer hover:text-gray-700 dark:hover:text-gray-300 w-32 text-right" @click="toggleSort('size')">
              <div class="flex items-center gap-1 justify-end">
                Size
                <div v-if="sortBy === 'size'" :class="sortIcon" class="text-blue-500" />
              </div>
            </th>
            <th class="px-4 py-2 w-24 text-right">Chunks</th>
            <th class="px-4 py-2 w-24 text-center">Emitted</th>
          </tr>
        </thead>
        <tbody>
          <tr
            v-for="asset in filteredAssets"
            :key="asset.name"
            class="border-b border-gray-100 dark:border-gray-800/50 hover:bg-orange-50/50 dark:hover:bg-orange-950/20 transition-colors"
          >
            <td class="px-4 py-3">
              <div class="flex items-center gap-2">
                <div :class="getFileIcon(asset.name)" />
                <span class="font-mono text-xs">{{ asset.name }}</span>
              </div>
            </td>
            <td class="px-4 py-3 text-right">
              <div class="flex items-center justify-end gap-2">
                <div
                  class="w-20 h-1.5 bg-gray-100 dark:bg-gray-800 rounded-full overflow-hidden"
                >
                  <div
                    class="h-full bg-orange-400 rounded-full"
                    :style="{ width: `${Math.max(2, (asset.size / (filteredAssets[0]?.size || 1)) * 100)}%` }"
                  />
                </div>
                <span class="font-mono text-xs font-medium w-20 text-right">{{ formatBytes(asset.size) }}</span>
              </div>
            </td>
            <td class="px-4 py-3 text-right text-xs text-gray-500">
              {{ asset.chunks.length }}
            </td>
            <td class="px-4 py-3 text-center">
              <div
                :class="asset.emitted ? 'i-carbon-checkmark-filled text-green-500' : 'i-carbon-close text-gray-300'"
              />
            </td>
          </tr>
        </tbody>
      </table>
    </div>
  </div>
</template>
