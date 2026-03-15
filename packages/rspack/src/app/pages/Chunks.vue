<script setup lang="ts">
import { formatBytes, useRpc } from '@/composables/rpc'
import { computed, ref } from 'vue'

const props = defineProps<{ session: any; sessionId: string }>()

const searchQuery = ref('')
const viewType = ref<'list' | 'treemap' | 'sunburst' | 'flamegraph'>('list')
const expandedChunks = ref<Set<string>>(new Set())
const filterType = ref<'all' | 'entry' | 'initial' | 'dynamic'>('all')

const chunks = computed(() => props.session?.chunks ?? [])

const filtered = computed(() => {
  let c = chunks.value
  if (filterType.value === 'entry') c = c.filter((ch: any) => ch.entry)
  if (filterType.value === 'initial') c = c.filter((ch: any) => ch.initial && !ch.entry)
  if (filterType.value === 'dynamic') c = c.filter((ch: any) => !ch.initial)
  if (searchQuery.value) {
    const q = searchQuery.value.toLowerCase()
    c = c.filter((ch: any) => ch.names.join(',').toLowerCase().includes(q) || ch.id.toLowerCase().includes(q))
  }
  return c
})

const totalSize = computed(() => filtered.value.reduce((s: number, c: any) => s + c.size, 0))
const maxSize = computed(() => Math.max(...filtered.value.map((c: any) => c.size), 1))

function toggleExpand(id: string) {
  const s = new Set(expandedChunks.value)
  s.has(id) ? s.delete(id) : s.add(id)
  expandedChunks.value = s
}

const sunburstLevels = computed(() => {
  const center = { label: 'Total', size: totalSize.value }
  const rings = filtered.value.map((ch: any) => ({
    label: ch.names[0] ?? ch.id,
    size: ch.size,
    type: ch.entry ? 'entry' : ch.initial ? 'initial' : 'dynamic',
    modules: ch.moduleCount,
  }))
  return { center, rings }
})

const flamegraphRows = computed(() => {
  return [...filtered.value].sort((a: any, b: any) => b.size - a.size).map((ch: any) => ({
    label: ch.names[0] ?? ch.id,
    size: ch.size,
    type: ch.entry ? 'entry' : ch.initial ? 'initial' : 'dynamic',
    modules: ch.moduleCount,
    percent: (ch.size / totalSize.value * 100).toFixed(1),
  }))
})
</script>

<template>
  <div class="h-full flex flex-col">
    <div class="p-4 border-b border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 space-y-3">
      <div class="flex items-center justify-between">
        <h1 class="text-xl font-bold flex items-center gap-2">
          <div class="i-carbon-cube text-purple-500" /> Chunks <span class="badge-gray text-xs">{{ filtered.length }}</span>
        </h1>
        <div class="text-sm text-gray-500">Total: <span class="font-mono font-medium">{{ formatBytes(totalSize) }}</span></div>
      </div>
      <div class="flex items-center gap-3">
        <div class="relative flex-1 max-w-md">
          <div class="i-carbon-search absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
          <input v-model="searchQuery" class="input-base pl-9" placeholder="Search chunks..." />
        </div>
        <div class="flex gap-1">
          <button v-for="v in (['list', 'treemap', 'sunburst', 'flamegraph'] as const)" :key="v"
            class="btn text-xs" :class="viewType === v ? 'bg-purple-100 dark:bg-purple-900 text-purple-700 dark:text-purple-300' : 'btn-ghost'"
            @click="viewType = v">{{ v[0].toUpperCase() + v.slice(1) }}</button>
        </div>
        <div class="flex gap-1">
          <button v-for="f in (['all', 'entry', 'initial', 'dynamic'] as const)" :key="f"
            class="btn text-xs" :class="filterType === f ? 'bg-purple-100 dark:bg-purple-900 text-purple-700 dark:text-purple-300' : 'btn-ghost'"
            @click="filterType = f">{{ f }}</button>
        </div>
      </div>
    </div>

    <!-- Treemap -->
    <div v-if="viewType === 'treemap'" class="flex-1 overflow-auto p-4">
      <div class="flex flex-wrap gap-1" style="min-height: 400px">
        <div v-for="chunk in filtered" :key="chunk.id"
          class="rounded cursor-pointer flex items-end p-2 text-xs font-mono transition-all hover:opacity-80"
          :class="chunk.entry ? 'bg-purple-300 dark:bg-purple-800' : chunk.initial ? 'bg-blue-200 dark:bg-blue-900' : 'bg-gray-200 dark:bg-gray-800'"
          :style="{ width: `${Math.max(80, Math.sqrt(chunk.size / 30))}px`, height: `${Math.max(50, Math.sqrt(chunk.size / 50))}px` }"
          :title="`${chunk.names[0] ?? chunk.id}: ${formatBytes(chunk.size)}`">
          <span class="truncate">{{ chunk.names[0] ?? chunk.id }}</span>
        </div>
      </div>
    </div>

    <!-- Sunburst -->
    <div v-else-if="viewType === 'sunburst'" class="flex-1 overflow-auto p-8 flex items-center justify-center">
      <div class="relative" style="width: 400px; height: 400px;">
        <svg viewBox="0 0 400 400" class="w-full h-full">
          <circle cx="200" cy="200" r="60" fill="#f3f4f6" stroke="#e5e7eb" stroke-width="1" />
          <text x="200" y="195" text-anchor="middle" class="text-xs font-medium" fill="#374151">Total</text>
          <text x="200" y="212" text-anchor="middle" class="text-xs font-mono" fill="#6b7280">{{ formatBytes(totalSize) }}</text>
          <g v-for="(ring, i) in sunburstLevels.rings" :key="i">
            <path
              :d="(() => {
                const total = sunburstLevels.rings.reduce((s, r) => s + r.size, 0)
                let startAngle = sunburstLevels.rings.slice(0, i).reduce((s, r) => s + r.size / total * Math.PI * 2, 0) - Math.PI / 2
                const angle = ring.size / total * Math.PI * 2
                const r1 = 70, r2 = 160
                const x1 = 200 + r1 * Math.cos(startAngle), y1 = 200 + r1 * Math.sin(startAngle)
                const x2 = 200 + r2 * Math.cos(startAngle), y2 = 200 + r2 * Math.sin(startAngle)
                const x3 = 200 + r2 * Math.cos(startAngle + angle), y3 = 200 + r2 * Math.sin(startAngle + angle)
                const x4 = 200 + r1 * Math.cos(startAngle + angle), y4 = 200 + r1 * Math.sin(startAngle + angle)
                const large = angle > Math.PI ? 1 : 0
                return `M${x1},${y1} L${x2},${y2} A${r2},${r2} 0 ${large} 1 ${x3},${y3} L${x4},${y4} A${r1},${r1} 0 ${large} 0 ${x1},${y1}`
              })()"
              :fill="ring.type === 'entry' ? '#a78bfa' : ring.type === 'initial' ? '#93c5fd' : '#d1d5db'"
              stroke="white" stroke-width="2" class="cursor-pointer hover:opacity-80 transition-opacity"
            >
              <title>{{ ring.label }}: {{ formatBytes(ring.size) }} ({{ ring.modules }} modules)</title>
            </path>
          </g>
        </svg>
      </div>
      <div class="ml-8 space-y-2">
        <div v-for="ring in sunburstLevels.rings" :key="ring.label" class="flex items-center gap-2 text-sm">
          <div class="w-3 h-3 rounded" :class="ring.type === 'entry' ? 'bg-purple-400' : ring.type === 'initial' ? 'bg-blue-300' : 'bg-gray-300'" />
          <span class="font-mono text-xs flex-1">{{ ring.label }}</span>
          <span class="font-mono text-xs text-gray-500">{{ formatBytes(ring.size) }}</span>
        </div>
      </div>
    </div>

    <!-- Flamegraph -->
    <div v-else-if="viewType === 'flamegraph'" class="flex-1 overflow-auto p-4 space-y-1">
      <div class="text-xs text-gray-500 mb-2 uppercase tracking-wide font-semibold">Chunk Size Distribution</div>
      <div v-for="row in flamegraphRows" :key="row.label" class="flex items-center gap-2">
        <div class="flex-1 h-8 rounded overflow-hidden relative cursor-pointer group"
          :style="{ maxWidth: `${Math.max(10, row.size / maxSize * 100)}%` }">
          <div class="absolute inset-0 transition-opacity"
            :class="row.type === 'entry' ? 'bg-gradient-to-r from-purple-400 to-purple-500' : row.type === 'initial' ? 'bg-gradient-to-r from-blue-300 to-blue-400' : 'bg-gradient-to-r from-gray-300 to-gray-400'" />
          <div class="absolute inset-0 flex items-center px-2 text-xs font-mono text-white font-medium truncate">
            {{ row.label }}
          </div>
        </div>
        <span class="font-mono text-xs text-gray-500 w-20 text-right shrink-0">{{ formatBytes(row.size) }}</span>
        <span class="text-xs text-gray-400 w-12 text-right shrink-0">{{ row.percent }}%</span>
      </div>
    </div>

    <!-- List view -->
    <div v-else class="flex-1 overflow-auto p-4 space-y-3">
      <div v-for="chunk in filtered" :key="chunk.id" class="card overflow-hidden">
        <div class="flex items-center gap-3 p-4 cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors"
          @click="toggleExpand(chunk.id)">
          <div :class="expandedChunks.has(chunk.id) ? 'i-carbon-chevron-down' : 'i-carbon-chevron-right'" class="text-gray-400 shrink-0" />
          <div class="i-carbon-cube shrink-0" :class="chunk.entry ? 'text-purple-500' : chunk.initial ? 'text-blue-500' : 'text-gray-400'" />
          <div class="flex-1 min-w-0">
            <div class="font-mono text-sm font-medium">{{ chunk.names[0] ?? chunk.id }}</div>
            <div class="text-xs text-gray-400 flex items-center gap-2">
              <span v-if="chunk.entry" class="badge-purple text-xs">entry</span>
              <span v-else-if="chunk.initial" class="badge-blue text-xs">initial</span>
              <span v-else class="badge-gray text-xs">dynamic</span>
              <span>{{ chunk.moduleCount }} modules</span><span>&middot;</span><span>{{ chunk.files.length }} files</span>
            </div>
          </div>
          <div class="font-mono text-sm font-medium text-right">{{ formatBytes(chunk.size) }}</div>
        </div>
        <div v-if="expandedChunks.has(chunk.id)" class="border-t border-gray-200 dark:border-gray-800 p-4 space-y-3 bg-gray-50 dark:bg-gray-900">
          <div class="grid grid-cols-2 md:grid-cols-4 gap-3 text-sm">
            <div><div class="text-xs text-gray-500">ID</div><div class="font-mono">{{ chunk.id }}</div></div>
            <div><div class="text-xs text-gray-500">Entry</div><div>{{ chunk.entry ? 'Yes' : 'No' }}</div></div>
            <div><div class="text-xs text-gray-500">Initial</div><div>{{ chunk.initial ? 'Yes' : 'No' }}</div></div>
            <div><div class="text-xs text-gray-500">Rendered</div><div>{{ chunk.rendered ? 'Yes' : 'No' }}</div></div>
          </div>
          <div v-if="chunk.files.length"><div class="text-xs text-gray-500 font-semibold mb-1">Output Files</div><div class="flex flex-wrap gap-1"><span v-for="f in chunk.files" :key="f" class="badge-blue text-xs font-mono">{{ f }}</span></div></div>
          <div v-if="chunk.origins?.length"><div class="text-xs text-gray-500 font-semibold mb-1">Origins</div><div class="space-y-1"><div v-for="(o, i) in chunk.origins" :key="i" class="font-mono text-xs text-gray-500">{{ o.moduleName }} <span v-if="o.loc" class="text-gray-400">({{ o.loc }})</span></div></div></div>
          <div v-if="chunk.parents?.length" class="text-sm"><span class="text-xs text-gray-500 font-semibold">Parents:</span><span v-for="p in chunk.parents" :key="p" class="badge-gray text-xs font-mono ml-1">{{ p }}</span></div>
          <div v-if="chunk.children?.length" class="text-sm"><span class="text-xs text-gray-500 font-semibold">Children:</span><span v-for="c in chunk.children" :key="c" class="badge-gray text-xs font-mono ml-1">{{ c }}</span></div>
        </div>
      </div>
    </div>
  </div>
</template>
