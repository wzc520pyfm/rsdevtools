<script setup lang="ts">
import { useRpc } from '../../composables/rpc'
import { computed, onMounted, ref } from 'vue'

const { call } = useRpc()

const activeTab = ref<'rpc' | 'docks' | 'scripts' | 'plugins'>('rpc')
const rpcFunctions = ref<Array<{ name: string, type: string }>>([])
const docks = ref<Array<{ id: string, title: string, type: string, icon?: string, category?: string }>>([])
const clientScripts = ref<Array<{ dockId: string, dockTitle: string, type: string, importFrom?: string, importName?: string }>>([])
const plugins = ref<Array<{ name: string, hasDevtools: boolean }>>([])
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

const filteredRpc = computed(() => {
  if (!search.value)
    return rpcFunctions.value
  const q = search.value.toLowerCase()
  return rpcFunctions.value.filter(f => f.name.toLowerCase().includes(q))
})

const rpcGroups = computed(() => {
  const groups = new Map<string, typeof rpcFunctions.value>()
  for (const fn of filteredRpc.value) {
    const ns = fn.name.includes(':') ? fn.name.split(':').slice(0, -1).join(':') : '(root)'
    if (!groups.has(ns))
      groups.set(ns, [])
    groups.get(ns)!.push(fn)
  }
  return Array.from(groups.entries()).sort((a, b) => a[0].localeCompare(b[0]))
})

const dockGroups = computed(() => {
  const groups = new Map<string, typeof docks.value>()
  for (const d of docks.value) {
    const cat = d.category ?? 'default'
    if (!groups.has(cat))
      groups.set(cat, [])
    groups.get(cat)!.push(d)
  }
  return Array.from(groups.entries())
})

const scriptGroups = computed(() => {
  const groups = new Map<string, typeof clientScripts.value>()
  for (const s of clientScripts.value) {
    if (!groups.has(s.type))
      groups.set(s.type, [])
    groups.get(s.type)!.push(s)
  }
  return Array.from(groups.entries())
})

function typeColor(type: string) {
  switch (type) {
    case 'query': return 'text-green bg-green/10'
    case 'action': return 'text-orange bg-orange/10'
    case 'static': return 'text-blue bg-blue/10'
    case 'iframe': return 'text-cyan bg-cyan/10'
    case 'custom-render': return 'text-violet bg-violet/10'
    case 'launcher': return 'text-amber bg-amber/10'
    case '~builtin': return 'text-pink bg-pink/10'
    case '~popup': return 'text-teal bg-teal/10'
    default: return 'op40 bg-gray/5'
  }
}

function hashColor(str: string, opacity: number): string {
  let hash = 0
  for (let i = 0; i < str.length; i++)
    hash = str.charCodeAt(i) + ((hash << 5) - hash)
  const h = hash % 360
  return `hsla(${h < 0 ? h + 360 : h}, 65%, 65%, ${opacity})`
}

const tabs = [
  { key: 'rpc', label: 'RPC', count: () => rpcFunctions.value.length },
  { key: 'docks', label: 'Docks', count: () => docks.value.length },
  { key: 'scripts', label: 'Scripts', count: () => clientScripts.value.length },
  { key: 'plugins', label: 'Plugins', count: () => plugins.value.length },
] as const
</script>

<template>
  <div class="w-full h-full grid grid-rows-[max-content_1fr]">
    <!-- Toolbar -->
    <div class="border-base border-b p3 flex flex-col gap-2">
      <div class="flex items-center gap-2">
        <div class="i-ph-magnifying-glass-duotone text-lg op60" />
        <h1 class="text-base font-semibold mr-auto op85">
          Self Inspect
        </h1>
        <button
          class="text-xs op50 hover:op100 px-1.5 py-0.5 hover:bg-active rounded transition flex items-center gap-0.5"
          @click="refresh"
        >
          <div class="i-ph-arrow-counter-clockwise-duotone w-3.5 h-3.5" />
          Refresh
        </button>
      </div>
      <div class="flex items-center gap-1">
        <button
          v-for="tab in tabs"
          :key="tab.key"
          class="px-2 py-1 text-xs rounded transition-colors flex items-center gap-1"
          :class="activeTab === tab.key ? 'bg-active color-active' : 'op40 hover:op80 hover:bg-active'"
          @click="activeTab = tab.key"
        >
          <span class="capitalize">{{ tab.label }}</span>
          <span class="px-1 py-0 text-[10px] rounded-sm" :class="activeTab === tab.key ? 'bg-active' : 'bg-gray/5'">{{ tab.count() }}</span>
        </button>
      </div>
    </div>

    <div class="h-full of-y-auto">
      <!-- RPC Functions -->
      <div v-if="activeTab === 'rpc'" class="p-4 space-y-3">
        <input
          v-model="search"
          class="w-full px-2 py-0.5 text-xs rounded bg-transparent border border-base outline-none focus:border-purple transition-colors"
          placeholder="Search RPC functions..."
        >
        <div v-for="[ns, fns] in rpcGroups" :key="ns" class="border border-base rounded-lg overflow-hidden">
          <div class="flex items-center gap-2 px-3 py-2 bg-gray/5 border-b border-base">
            <span class="text-xs font-mono op40">{{ ns }}</span>
            <span class="text-[10px] op25">({{ fns.length }})</span>
          </div>
          <div>
            <div
              v-for="(fn, i) in fns"
              :key="fn.name"
              class="flex items-center gap-2 px-3 py-2 hover:bg-active transition-colors"
              :class="i < fns.length - 1 ? 'border-b border-base' : ''"
            >
              <span class="text-sm font-mono truncate op70">{{ fn.name.split(':').pop() }}</span>
              <span class="ml-auto px-1.5 py-0.5 text-[10px] rounded font-medium shrink-0" :class="typeColor(fn.type)">{{ fn.type }}</span>
            </div>
          </div>
        </div>
        <div v-if="filteredRpc.length === 0" class="text-sm op40 text-center py-8">
          {{ search ? 'No matching functions' : 'No RPC functions registered' }}
        </div>
      </div>

      <!-- Docks -->
      <div v-if="activeTab === 'docks'" class="p-4 space-y-3">
        <div v-for="[cat, entries] in dockGroups" :key="cat" class="border border-base rounded-lg overflow-hidden">
          <div class="flex items-center gap-2 px-3 py-2 bg-gray/5 border-b border-base">
            <span class="text-xs font-medium op40 capitalize">{{ cat }}</span>
            <span class="text-[10px] op25">({{ entries.length }})</span>
          </div>
          <div>
            <div
              v-for="(entry, i) in entries"
              :key="entry.id"
              class="flex items-center gap-3 px-3 py-2.5 hover:bg-active transition-colors"
              :class="i < entries.length - 1 ? 'border-b border-base' : ''"
            >
              <div class="flex-1 min-w-0">
                <div class="text-sm op75 truncate">{{ entry.title }}</div>
                <div class="text-[11px] font-mono op25 truncate">{{ entry.id }}</div>
              </div>
              <span class="px-1.5 py-0.5 text-[10px] rounded font-medium shrink-0" :class="typeColor(entry.type)">{{ entry.type }}</span>
            </div>
          </div>
        </div>
        <div v-if="docks.length === 0" class="text-sm op40 text-center py-8">
          No dock entries
        </div>
      </div>

      <!-- Client Scripts -->
      <div v-if="activeTab === 'scripts'" class="p-4 space-y-3">
        <div v-for="[type, scripts] in scriptGroups" :key="type" class="border border-base rounded-lg overflow-hidden">
          <div class="flex items-center gap-2 px-3 py-2 bg-gray/5 border-b border-base">
            <span class="text-xs font-medium op40 capitalize">{{ type }}</span>
            <span class="text-[10px] op25">({{ scripts.length }})</span>
          </div>
          <div>
            <div
              v-for="(s, i) in scripts"
              :key="s.dockId"
              class="px-3 py-2.5 hover:bg-active transition-colors"
              :class="i < scripts.length - 1 ? 'border-b border-base' : ''"
            >
              <div class="flex items-center gap-2 mb-0.5">
                <span class="text-sm font-medium op75">{{ s.dockTitle }}</span>
                <span class="text-[11px] font-mono op25">{{ s.dockId }}</span>
              </div>
              <div v-if="s.importFrom" class="text-xs font-mono op30">
                {{ s.importFrom }}{{ s.importName ? ` → ${s.importName}` : '' }}
              </div>
            </div>
          </div>
        </div>
        <div v-if="clientScripts.length === 0" class="text-sm op40 text-center py-8">
          No client scripts registered
        </div>
      </div>

      <!-- Plugins -->
      <div v-if="activeTab === 'plugins'" class="p-4 space-y-1">
        <div
          v-for="p in plugins"
          :key="p.name"
          class="flex items-center gap-3 px-3 py-2.5 rounded-lg border border-base hover:bg-active transition-colors"
        >
          <div class="w-7 h-7 rounded-md flex items-center justify-center shrink-0" :style="{ backgroundColor: hashColor(p.name, 0.1) }">
            <div class="i-ph-plug-duotone text-sm" :style="{ color: hashColor(p.name, 0.8) }" />
          </div>
          <span class="text-sm op75 flex-1">{{ p.name }}</span>
          <span
            v-if="p.hasDevtools"
            class="px-1.5 py-0.5 text-[10px] rounded font-medium text-purple bg-purple/10"
          >devtools</span>
        </div>
        <div v-if="plugins.length === 0" class="text-sm op40 text-center py-8">
          No plugins reported
        </div>
      </div>
    </div>
  </div>
</template>
