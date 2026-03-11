<script setup lang="ts">
import { useRpc } from '@/composables/rpc'
import Fuse from 'fuse.js'
import { computed, onMounted, ref } from 'vue'

const props = defineProps<{ session: any; sessionId: string }>()
const { call } = useRpc()

const plugins = ref<any[]>([])
const searchQuery = ref('')
const loading = ref(true)
const selectedPlugin = ref<any>(null)

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

const builtinPlugins = ['RspackDevToolsPlugin', 'HtmlRspackPlugin', 'CssExtractRspackPlugin', 'HotModuleReplacementPlugin', 'DefinePlugin', 'ProvidePlugin']

function isBuiltin(name: string): boolean {
  return builtinPlugins.some(b => name.includes(b))
}
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

    <div v-else class="flex-1 flex overflow-hidden">
      <div class="flex-1 overflow-auto p-4">
        <!-- Pipeline view -->
        <div class="mb-6">
          <div class="text-xs text-gray-500 uppercase tracking-wide font-semibold mb-3">Plugin Pipeline</div>
          <div class="flex items-center gap-1 flex-wrap">
            <template v-for="(plugin, i) in filtered" :key="plugin.name">
              <div class="flex items-center gap-1 cursor-pointer group" @click="selectedPlugin = selectedPlugin?.name === plugin.name ? null : plugin">
                <div class="px-3 py-2 rounded-lg text-xs font-mono transition-all border-2"
                  :class="[
                    selectedPlugin?.name === plugin.name ? 'border-purple-500 bg-purple-50 dark:bg-purple-950' : 'border-transparent hover:border-purple-300',
                    pluginColors[i % pluginColors.length]
                  ]">
                  {{ plugin.name }}
                </div>
              </div>
              <div v-if="i < filtered.length - 1" class="i-carbon-arrow-right text-gray-300 shrink-0" />
            </template>
          </div>
        </div>

        <!-- Grid view -->
        <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
          <div v-for="(plugin, i) in filtered" :key="plugin.name"
            class="card p-4 cursor-pointer transition-all"
            :class="selectedPlugin?.name === plugin.name ? 'ring-2 ring-purple-400 shadow-md' : 'hover:shadow-md'"
            @click="selectedPlugin = selectedPlugin?.name === plugin.name ? null : plugin">
            <div class="flex items-center gap-3">
              <div class="w-10 h-10 rounded-lg flex items-center justify-center shrink-0 text-lg font-bold"
                :class="pluginColors[i % pluginColors.length]">
                {{ plugin.name.charAt(0).toUpperCase() }}
              </div>
              <div class="min-w-0">
                <div class="font-medium text-sm truncate" :title="plugin.name">{{ plugin.name }}</div>
                <div class="text-xs text-gray-400 flex items-center gap-2">
                  <span class="font-mono">#{{ plugin.index }}</span>
                  <span v-if="isBuiltin(plugin.name)" class="badge-blue text-xs">builtin</span>
                  <span v-else class="badge-green text-xs">custom</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div v-if="filtered.length === 0" class="text-center py-12 text-gray-400">
          <div class="i-carbon-search text-4xl mb-2 mx-auto" /> No plugins found
        </div>
      </div>

      <!-- Detail panel -->
      <Transition enter-active-class="transition-all duration-200" leave-active-class="transition-all duration-150"
        enter-from-class="translate-x-full" leave-to-class="translate-x-full">
        <div v-if="selectedPlugin" class="w-72 border-l border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 overflow-auto">
          <div class="p-4 border-b border-gray-200 dark:border-gray-800 sticky top-0 bg-white dark:bg-gray-900">
            <div class="flex items-center justify-between">
              <h3 class="font-semibold text-sm truncate">{{ selectedPlugin.name }}</h3>
              <button class="btn-ghost p-1" @click="selectedPlugin = null"><div class="i-carbon-close" /></button>
            </div>
          </div>
          <div class="p-4 space-y-4">
            <div>
              <div class="text-xs text-gray-500">Execution Order</div>
              <div class="text-2xl font-bold font-mono">{{ selectedPlugin.index }}</div>
            </div>
            <div>
              <div class="text-xs text-gray-500">Type</div>
              <div>{{ isBuiltin(selectedPlugin.name) ? 'Built-in / Framework' : 'Custom / Third-party' }}</div>
            </div>
            <div>
              <div class="text-xs text-gray-500">Total Plugins</div>
              <div class="font-mono">{{ plugins.length }}</div>
            </div>
            <div class="border-t border-gray-200 dark:border-gray-800 pt-4">
              <div class="text-xs text-gray-500 font-semibold mb-2">Session Stats</div>
              <div class="grid grid-cols-2 gap-3 text-sm">
                <div><div class="text-xs text-gray-500">Modules</div><div class="font-mono font-medium">{{ session?.modules?.length ?? 0 }}</div></div>
                <div><div class="text-xs text-gray-500">Chunks</div><div class="font-mono font-medium">{{ session?.chunks?.length ?? 0 }}</div></div>
                <div><div class="text-xs text-gray-500">Assets</div><div class="font-mono font-medium">{{ session?.assets?.length ?? 0 }}</div></div>
                <div><div class="text-xs text-gray-500">Packages</div><div class="font-mono font-medium">{{ session?.packages?.length ?? 0 }}</div></div>
              </div>
            </div>
          </div>
        </div>
      </Transition>
    </div>
  </div>
</template>
