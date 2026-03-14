<script setup lang="ts">
import { useRpc } from '@/composables/rpc'
import { onMounted, ref } from 'vue'

const { call } = useRpc()

const activeTab = ref<'rpc' | 'docks' | 'scripts' | 'plugins'>('rpc')

const rpcFunctions = ref<Array<{ name: string; type: string }>>([])
const docks = ref<Array<{ id: string; title: string; type: string; icon?: string; category?: string }>>([])
const clientScripts = ref<Array<{ dockId: string; dockTitle: string; type: string; importFrom?: string; importName?: string }>>([])
const plugins = ref<Array<{ name: string; hasDevtools: boolean }>>([])

const search = ref('')

async function refresh() {
  try {
    const [r, d, s, p] = await Promise.all([
      call('devtoolskit:self-inspect:get-rpc-functions'),
      call('devtoolskit:self-inspect:get-docks'),
      call('devtoolskit:self-inspect:get-client-scripts'),
      call('devtoolskit:self-inspect:get-devtools-plugins'),
    ])
    rpcFunctions.value = r
    docks.value = d
    clientScripts.value = s
    plugins.value = p
  }
  catch {}
}

onMounted(refresh)

function filteredRpc() {
  if (!search.value) return rpcFunctions.value
  const q = search.value.toLowerCase()
  return rpcFunctions.value.filter(f => f.name.toLowerCase().includes(q))
}

function rpcGroups() {
  const groups = new Map<string, typeof rpcFunctions.value>()
  for (const fn of filteredRpc()) {
    const ns = fn.name.includes(':') ? fn.name.split(':').slice(0, -1).join(':') : '(root)'
    if (!groups.has(ns)) groups.set(ns, [])
    groups.get(ns)!.push(fn)
  }
  return Array.from(groups.entries()).sort((a, b) => a[0].localeCompare(b[0]))
}

function dockGroups() {
  const groups = new Map<string, typeof docks.value>()
  for (const d of docks.value) {
    const cat = d.category ?? 'default'
    if (!groups.has(cat)) groups.set(cat, [])
    groups.get(cat)!.push(d)
  }
  return Array.from(groups.entries())
}

function scriptGroups() {
  const groups = new Map<string, typeof clientScripts.value>()
  for (const s of clientScripts.value) {
    if (!groups.has(s.type)) groups.set(s.type, [])
    groups.get(s.type)!.push(s)
  }
  return Array.from(groups.entries())
}

function typeColor(type: string) {
  switch (type) {
    case 'query': return 'text-green-500 bg-green-500/10'
    case 'action': return 'text-orange-500 bg-orange-500/10'
    case 'static': return 'text-blue-500 bg-blue-500/10'
    default: return 'text-gray-400 bg-gray-500/10'
  }
}
</script>

<template>
  <div class="h-screen flex flex-col bg-gray-50 dark:bg-gray-950 text-gray-900 dark:text-gray-100">
    <!-- Header -->
    <div class="px-4 py-3 border-b border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 shrink-0">
      <div class="flex items-center gap-2 mb-2">
        <div class="i-carbon-search-locate text-lg text-purple-500" />
        <h1 class="text-base font-semibold mr-auto">
          Self Inspect
        </h1>
        <button
          class="px-2 py-1 text-xs rounded-md border border-gray-200 dark:border-gray-700 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
          @click="refresh"
        >
          Refresh
        </button>
      </div>
      <!-- Tabs -->
      <div class="flex items-center gap-1">
        <button
          v-for="tab in (['rpc', 'docks', 'scripts', 'plugins'] as const)" :key="tab"
          class="px-3 py-1 text-xs rounded-md transition-colors capitalize"
          :class="activeTab === tab ? 'bg-purple-500 text-white' : 'text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800'"
          @click="activeTab = tab"
        >
          {{ tab === 'rpc' ? `RPC (${rpcFunctions.length})` : tab === 'docks' ? `Docks (${docks.length})` : tab === 'scripts' ? `Scripts (${clientScripts.length})` : `Plugins (${plugins.length})` }}
        </button>
      </div>
    </div>

    <div class="flex-1 overflow-y-auto">
      <!-- RPC Functions -->
      <div v-if="activeTab === 'rpc'" class="p-4 space-y-4">
        <input
          v-model="search"
          class="w-full px-2.5 py-1 text-sm rounded-md bg-gray-100 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 outline-none focus:border-purple-400 transition-colors"
          placeholder="Search RPC functions..."
        >
        <div v-for="[ns, fns] in rpcGroups()" :key="ns">
          <div class="text-xs text-gray-400 uppercase tracking-wider mb-2">
            {{ ns }}
          </div>
          <div class="space-y-1">
            <div v-for="fn in fns" :key="fn.name" class="flex items-center gap-2 px-3 py-1.5 rounded-md bg-white dark:bg-gray-900 border border-gray-100 dark:border-gray-800">
              <span class="text-sm font-mono truncate">{{ fn.name }}</span>
              <span class="ml-auto px-1.5 py-0.5 text-[10px] rounded font-medium" :class="typeColor(fn.type)">{{ fn.type }}</span>
            </div>
          </div>
        </div>
      </div>

      <!-- Docks -->
      <div v-if="activeTab === 'docks'" class="p-4 space-y-4">
        <div v-for="[cat, entries] in dockGroups()" :key="cat">
          <div class="text-xs text-gray-400 uppercase tracking-wider mb-2">
            {{ cat }}
          </div>
          <div class="space-y-1">
            <div v-for="entry in entries" :key="entry.id" class="flex items-center gap-2 px-3 py-1.5 rounded-md bg-white dark:bg-gray-900 border border-gray-100 dark:border-gray-800">
              <span class="text-sm">{{ entry.title }}</span>
              <span class="text-xs text-gray-400 font-mono">{{ entry.id }}</span>
              <span class="ml-auto px-1.5 py-0.5 text-[10px] rounded font-medium" :class="typeColor(entry.type)">{{ entry.type }}</span>
            </div>
          </div>
        </div>
        <div v-if="docks.length === 0" class="text-sm text-gray-400 text-center py-8">
          No dock entries
        </div>
      </div>

      <!-- Client Scripts -->
      <div v-if="activeTab === 'scripts'" class="p-4 space-y-4">
        <div v-for="[type, scripts] in scriptGroups()" :key="type">
          <div class="text-xs text-gray-400 uppercase tracking-wider mb-2">
            {{ type }}
          </div>
          <div class="space-y-1">
            <div v-for="s in scripts" :key="s.dockId" class="px-3 py-2 rounded-md bg-white dark:bg-gray-900 border border-gray-100 dark:border-gray-800 space-y-1">
              <div class="flex items-center gap-2">
                <span class="text-sm font-semibold">{{ s.dockTitle }}</span>
                <span class="text-xs text-gray-400">{{ s.dockId }}</span>
              </div>
              <div v-if="s.importFrom" class="text-xs text-gray-400 font-mono">
                {{ s.importFrom }}{{ s.importName ? ` (${s.importName})` : '' }}
              </div>
            </div>
          </div>
        </div>
        <div v-if="clientScripts.length === 0" class="text-sm text-gray-400 text-center py-8">
          No client scripts registered
        </div>
      </div>

      <!-- Plugins -->
      <div v-if="activeTab === 'plugins'" class="p-4 space-y-1">
        <div v-for="p in plugins" :key="p.name" class="flex items-center gap-2 px-3 py-1.5 rounded-md bg-white dark:bg-gray-900 border border-gray-100 dark:border-gray-800">
          <span class="text-sm">{{ p.name }}</span>
          <span v-if="p.hasDevtools" class="ml-auto px-1.5 py-0.5 text-[10px] rounded font-medium text-purple-500 bg-purple-500/10">devtools</span>
        </div>
        <div v-if="plugins.length === 0" class="text-sm text-gray-400 text-center py-8">
          No plugins reported
        </div>
      </div>
    </div>
  </div>
</template>
