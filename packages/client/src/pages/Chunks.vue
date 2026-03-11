<script setup lang="ts">
import { formatBytes, useRpc } from '@/composables/rpc'
import { computed, ref } from 'vue'

const props = defineProps<{ session: any; sessionId: string }>()
const { call } = useRpc()

const searchQuery = ref('')
const viewType = ref<'list' | 'treemap'>('list')
const expandedChunks = ref<Set<string>>(new Set())
const selectedChunk = ref<any>(null)
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

function toggleExpand(id: string) {
  const s = new Set(expandedChunks.value)
  s.has(id) ? s.delete(id) : s.add(id)
  expandedChunks.value = s
}
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
          <button v-for="v in (['list', 'treemap'] as const)" :key="v"
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
          :class="chunk.entry ? 'bg-purple-300 dark:bg-purple-800 text-purple-900 dark:text-purple-100' : chunk.initial ? 'bg-blue-200 dark:bg-blue-900 text-blue-900 dark:text-blue-100' : 'bg-gray-200 dark:bg-gray-800 text-gray-900 dark:text-gray-100'"
          :style="{ width: `${Math.max(80, Math.sqrt(chunk.size / 30))}px`, height: `${Math.max(50, Math.sqrt(chunk.size / 50))}px` }"
          :title="`${chunk.names[0] ?? chunk.id}: ${formatBytes(chunk.size)}`"
          @click="selectedChunk = selectedChunk?.id === chunk.id ? null : chunk">
          <span class="truncate">{{ chunk.names[0] ?? chunk.id }}</span>
        </div>
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
              <span>{{ chunk.moduleCount }} modules</span>
              <span>&middot;</span>
              <span>{{ chunk.files.length }} files</span>
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

          <div v-if="chunk.files.length">
            <div class="text-xs text-gray-500 font-semibold mb-1">Output Files</div>
            <div class="flex flex-wrap gap-1">
              <span v-for="f in chunk.files" :key="f" class="badge-blue text-xs font-mono">{{ f }}</span>
            </div>
          </div>

          <div v-if="chunk.origins?.length">
            <div class="text-xs text-gray-500 font-semibold mb-1">Origins</div>
            <div class="space-y-1">
              <div v-for="(o, i) in chunk.origins" :key="i" class="font-mono text-xs text-gray-500">
                {{ o.moduleName }} <span v-if="o.loc" class="text-gray-400">({{ o.loc }})</span>
              </div>
            </div>
          </div>

          <div v-if="chunk.parents?.length" class="text-sm">
            <span class="text-xs text-gray-500 font-semibold">Parents:</span>
            <span v-for="p in chunk.parents" :key="p" class="badge-gray text-xs font-mono ml-1">{{ p }}</span>
          </div>
          <div v-if="chunk.children?.length" class="text-sm">
            <span class="text-xs text-gray-500 font-semibold">Children:</span>
            <span v-for="c in chunk.children" :key="c" class="badge-gray text-xs font-mono ml-1">{{ c }}</span>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>
