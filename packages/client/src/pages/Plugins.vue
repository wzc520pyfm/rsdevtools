<script setup lang="ts">
import { useRpc } from '@/composables/rpc'
import Fuse from 'fuse.js'
import { computed, onMounted, ref } from 'vue'

const props = defineProps<{ session: any; sessionId: string }>()
const { call } = useRpc()

const plugins = ref<any[]>([])
const searchQuery = ref('')
const loading = ref(true)

onMounted(async () => {
  try { plugins.value = await call('rspack:get-plugins', { session: props.sessionId }) } catch {}
  loading.value = false
})

const fuse = computed(() => new Fuse(plugins.value, { keys: ['name'], threshold: 0.4, ignoreLocation: true }))

const filtered = computed(() => {
  if (!searchQuery.value) return plugins.value
  return fuse.value.search(searchQuery.value).map(r => r.item)
})

const pluginColors = [
  'bg-blue-100 dark:bg-blue-900/40 text-blue-700 dark:text-blue-300',
  'bg-purple-100 dark:bg-purple-900/40 text-purple-700 dark:text-purple-300',
  'bg-green-100 dark:bg-green-900/40 text-green-700 dark:text-green-300',
  'bg-orange-100 dark:bg-orange-900/40 text-orange-700 dark:text-orange-300',
  'bg-cyan-100 dark:bg-cyan-900/40 text-cyan-700 dark:text-cyan-300',
  'bg-pink-100 dark:bg-pink-900/40 text-pink-700 dark:text-pink-300',
]
</script>

<template>
  <div class="h-full flex flex-col">
    <div class="p-4 border-b border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 space-y-3">
      <div class="flex items-center justify-between">
        <h1 class="text-xl font-bold flex items-center gap-2">
          <div class="i-carbon-plug text-purple-500" />
          Plugins
          <span class="badge-gray text-xs">{{ filtered.length }}</span>
        </h1>
      </div>
      <div class="relative max-w-md">
        <div class="i-carbon-search absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
        <input v-model="searchQuery" class="input-base pl-9" placeholder="Search plugins..." />
      </div>
    </div>

    <div v-if="loading" class="flex-1 flex items-center justify-center text-gray-400">
      <div class="i-carbon-renew animate-spin mr-2" /> Loading plugins...
    </div>

    <div v-else class="flex-1 overflow-auto p-4">
      <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
        <div v-for="(plugin, i) in filtered" :key="plugin.name"
          class="card p-4 flex items-center gap-3 hover:shadow-md transition-shadow">
          <div class="w-10 h-10 rounded-lg flex items-center justify-center shrink-0 text-lg font-bold"
            :class="pluginColors[i % pluginColors.length]">
            {{ plugin.name.charAt(0).toUpperCase() }}
          </div>
          <div class="min-w-0">
            <div class="font-medium text-sm truncate" :title="plugin.name">{{ plugin.name }}</div>
            <div class="text-xs text-gray-400 font-mono">#{{ plugin.index }}</div>
          </div>
        </div>
      </div>

      <div v-if="filtered.length === 0" class="text-center py-12 text-gray-400">
        <div class="i-carbon-search text-4xl mb-2 mx-auto" />
        No plugins found
      </div>
    </div>
  </div>
</template>
