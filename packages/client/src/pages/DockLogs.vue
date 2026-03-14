<script setup lang="ts">
import { useRpc } from '@/composables/rpc'
import { computed, onMounted, onUnmounted, ref } from 'vue'

const { call, onLogsUpdated } = useRpc()

interface LogEntry {
  id: string
  message: string
  level: 'info' | 'warn' | 'error' | 'success' | 'debug'
  description?: string
  from: string
  timestamp: number
  notify?: boolean
  filePosition?: { file: string; line?: number; column?: number }
  elementPosition?: { selector?: string; description?: string }
  status?: 'loading' | 'idle'
  category?: string
  labels?: string[]
  stacktrace?: string
  autoDismiss?: number
  autoDelete?: number
}

const entries = ref<LogEntry[]>([])
const entryMap = new Map<string, LogEntry>()
let lastVersion: number | undefined

const search = ref('')
const activeFilters = ref<Set<string>>(new Set())
const activeFromFilters = ref<Set<string>>(new Set())
const selectedId = ref<string | null>(null)
const sortBy = ref<'newest' | 'oldest' | 'level'>('newest')

const levels: Record<string, { icon: string; color: string; bg: string; label: string }> = {
  info: { icon: 'i-carbon-information', color: 'text-blue-400', bg: 'bg-blue-400', label: 'Info' },
  warn: { icon: 'i-carbon-warning-alt', color: 'text-amber-400', bg: 'bg-amber-400', label: 'Warning' },
  error: { icon: 'i-carbon-error', color: 'text-red-400', bg: 'bg-red-400', label: 'Error' },
  success: { icon: 'i-carbon-checkmark', color: 'text-green-400', bg: 'bg-green-400', label: 'Success' },
  debug: { icon: 'i-carbon-debug', color: 'text-gray-400', bg: 'bg-gray-500', label: 'Debug' },
}

const fromEntries: Record<string, { icon: string; color: string; label: string }> = {
  server: { icon: 'i-carbon-cloud', color: 'text-cyan-400', label: 'Server' },
  browser: { icon: 'i-carbon-application', color: 'text-violet-400', label: 'Browser' },
}

const sortModes = ['newest', 'oldest', 'level'] as const
const sortIcons: Record<string, string> = { newest: 'i-carbon-sort-descending', oldest: 'i-carbon-sort-ascending', level: 'i-carbon-warning' }
const sortLabels: Record<string, string> = { newest: 'Newest first', oldest: 'Oldest first', level: 'By severity' }

function cycleSortMode() {
  const idx = sortModes.indexOf(sortBy.value)
  sortBy.value = sortModes[(idx + 1) % sortModes.length]
}

async function updateLogs() {
  try {
    const result = await call('devtoolskit:internal:logs:list', lastVersion)
    for (const id of result.removedIds) entryMap.delete(id)
    for (const entry of result.entries) entryMap.set(entry.id, entry)
    entries.value = Array.from(entryMap.values())
    lastVersion = result.version
  }
  catch {}
}

const levelPriority: Record<string, number> = { error: 0, warn: 1, info: 2, success: 3, debug: 4 }

const filteredEntries = computed(() => {
  let result = entries.value
  if (activeFilters.value.size > 0)
    result = result.filter(e => activeFilters.value.has(e.level))
  if (activeFromFilters.value.size > 0)
    result = result.filter(e => activeFromFilters.value.has(e.from))
  if (search.value) {
    const q = search.value.toLowerCase()
    result = result.filter(e =>
      e.message.toLowerCase().includes(q)
      || e.description?.toLowerCase().includes(q)
      || e.category?.toLowerCase().includes(q)
      || e.labels?.some(l => l.toLowerCase().includes(q)),
    )
  }
  if (sortBy.value === 'oldest') return [...result]
  if (sortBy.value === 'level') return [...result].sort((a, b) => (levelPriority[a.level] ?? 9) - (levelPriority[b.level] ?? 9))
  return [...result].reverse()
})

const hasActiveFilter = computed(() => activeFilters.value.size > 0 || activeFromFilters.value.size > 0 || search.value.length > 0)

const selectedEntry = computed(() => selectedId.value ? entryMap.get(selectedId.value) ?? null : null)

const allLabels = computed(() => {
  const s = new Set<string>()
  for (const e of entries.value) e.labels?.forEach(l => s.add(l))
  return Array.from(s).sort()
})

const allCategories = computed(() => {
  const s = new Set<string>()
  for (const e of entries.value) if (e.category) s.add(e.category)
  return Array.from(s).sort()
})

function toggleFilter(level: string) {
  if (activeFilters.value.has(level)) activeFilters.value.delete(level)
  else activeFilters.value.add(level)
  activeFilters.value = new Set(activeFilters.value)
}

function toggleFrom(from: string) {
  if (activeFromFilters.value.has(from)) activeFromFilters.value.delete(from)
  else activeFromFilters.value.add(from)
  activeFromFilters.value = new Set(activeFromFilters.value)
}

function resetFilters() {
  activeFilters.value = new Set()
  activeFromFilters.value = new Set()
  search.value = ''
}

function timeAgo(ts: number): string {
  const diff = Date.now() - ts
  if (diff < 5000) return 'just now'
  if (diff < 60000) return `${Math.floor(diff / 1000)}s ago`
  if (diff < 3600000) return `${Math.floor(diff / 60000)}m ago`
  if (diff < 86400000) return `${Math.floor(diff / 3600000)}h ago`
  return `${Math.floor(diff / 86400000)}d ago`
}

function hashColor(str: string, opacity: number): string {
  let hash = 0
  for (let i = 0; i < str.length; i++) hash = str.charCodeAt(i) + ((hash << 5) - hash)
  const h = hash % 360
  return `hsla(${h < 0 ? h + 360 : h}, 65%, 65%, ${opacity})`
}

async function clearAll() {
  try { await call('devtoolskit:internal:logs:clear'); entryMap.clear(); entries.value = []; selectedId.value = null; lastVersion = undefined }
  catch {}
}

async function removeEntry(id: string) {
  try { await call('devtoolskit:internal:logs:remove', id); entryMap.delete(id); entries.value = Array.from(entryMap.values()); if (selectedId.value === id) selectedId.value = null }
  catch {}
}

async function dismissFiltered() {
  for (const e of filteredEntries.value) await call('devtoolskit:internal:logs:remove', e.id)
  selectedId.value = null
}

onMounted(updateLogs)
const unsub = onLogsUpdated(updateLogs)
onUnmounted(unsub)
</script>

<template>
  <div class="h-screen w-full grid grid-rows-[max-content_1fr] bg-[#1a1a2e] text-white/85 text-sm">
    <!-- Toolbar -->
    <div class="border-b border-white/8 p-3 flex flex-col gap-2">
      <!-- Row 1: Search + sort + actions -->
      <div class="flex items-center gap-1.5">
        <input
          v-model="search" type="text" placeholder="Search logs..."
          class="bg-transparent border border-white/10 rounded px-2 py-1 text-xs w-48 outline-none focus:border-purple-400/60 text-white/80 placeholder-white/30"
        >
        <button
          class="flex items-center gap-0.5 text-white/40 hover:text-white/80 p-1 rounded hover:bg-white/5 transition"
          :title="sortLabels[sortBy]"
          @click="cycleSortMode"
        >
          <div :class="sortIcons[sortBy]" class="w-4 h-4" />
        </button>
        <div class="flex-1" />
        <span v-if="filteredEntries.length !== entries.length" class="text-xs text-white/30">
          {{ filteredEntries.length }}/{{ entries.length }}
        </span>
        <button
          v-if="hasActiveFilter"
          class="text-xs text-white/40 hover:text-white/80 px-1.5 py-0.5 hover:bg-white/5 rounded transition flex items-center gap-1"
          @click="resetFilters"
        >
          <div class="i-carbon-filter-remove w-3.5 h-3.5" />
          Reset
        </button>
        <div v-if="hasActiveFilter" class="border-l border-white/10 h-4 mx-0.5" />
        <button
          v-if="hasActiveFilter && filteredEntries.length > 0"
          class="text-xs text-white/40 hover:text-white/80 px-1.5 py-0.5 hover:bg-white/5 rounded transition flex items-center gap-1"
          @click="dismissFiltered"
        >
          <div class="i-carbon-trash-can w-3.5 h-3.5" />
          Dismiss filtered
        </button>
        <button
          v-if="!hasActiveFilter && entries.length > 0"
          class="text-xs text-white/40 hover:text-white/80 px-1.5 py-0.5 hover:bg-white/5 rounded transition flex items-center gap-1"
          @click="clearAll"
        >
          <div class="i-carbon-trash-can w-3.5 h-3.5" />
          Dismiss all
        </button>
      </div>

      <!-- Row 2: Filter toggles -->
      <div class="flex flex-wrap items-center gap-1">
        <span class="text-xs text-white/30">Level</span>
        <div class="flex items-center gap-0.5">
          <button
            v-for="lv in (['info','warn','error','success','debug'] as const)" :key="lv"
            class="px-1.5 py-0.5 rounded text-xs flex items-center gap-0.5 hover:bg-white/5 transition"
            :class="activeFilters.size === 0 || activeFilters.has(lv) ? levels[lv].color : 'text-white/20'"
            @click="toggleFilter(lv)"
          >
            <div :class="levels[lv].icon" class="w-3.5 h-3.5" />
            <span>{{ levels[lv].label }}</span>
          </button>
        </div>

        <div class="border-l border-white/10 h-4 mx-1" />

        <span class="text-xs text-white/30">From</span>
        <div class="flex items-center gap-0.5">
          <button
            v-for="f in (['server','browser'] as const)" :key="f"
            class="px-1.5 py-0.5 rounded text-xs flex items-center gap-0.5 hover:bg-white/5 transition"
            :class="activeFromFilters.size === 0 || activeFromFilters.has(f) ? fromEntries[f].color : 'text-white/20'"
            @click="toggleFrom(f)"
          >
            <div :class="fromEntries[f].icon" class="w-3.5 h-3.5" />
            <span>{{ fromEntries[f].label }}</span>
          </button>
        </div>
      </div>
    </div>

    <!-- Content -->
    <div class="h-full overflow-hidden" :class="selectedEntry ? 'grid grid-cols-[1fr_1fr]' : ''">
      <!-- Log list -->
      <div class="h-full overflow-y-auto">
        <div v-if="filteredEntries.length === 0" class="flex items-center justify-center h-full text-white/30 text-sm">
          No logs
        </div>
        <div
          v-for="entry in filteredEntries" :key="entry.id"
          class="w-full border-b border-white/5 hover:bg-white/[0.03] transition cursor-pointer group"
          :class="selectedId === entry.id ? 'bg-white/[0.05]' : ''"
          @click="selectedId = selectedId === entry.id ? null : entry.id"
        >
          <!-- Log item -->
          <div class="flex items-start gap-2 px-3 py-2.5 relative">
            <!-- Level bar -->
            <div class="w-0.5 flex-none absolute left-0 top-1 bottom-1 rounded-r" :class="levels[entry.level]?.bg || 'bg-gray-500'" />

            <!-- Icon -->
            <div
              v-if="entry.status === 'loading'"
              class="flex-none mt-0.5 w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin text-white/40"
            />
            <div v-else class="flex-none mt-0.5 w-4 h-4" :class="[levels[entry.level]?.icon, levels[entry.level]?.color]" />

            <!-- Content -->
            <div class="flex-1 min-w-0">
              <div class="truncate text-sm font-medium" :class="entry.status === 'loading' ? 'text-white/50' : 'text-white/85'">
                {{ entry.message }}
              </div>
              <div v-if="entry.description" class="text-xs text-white/50 mt-0.5 line-clamp-2">
                {{ entry.description }}
              </div>
              <div v-if="entry.category || (entry.labels && entry.labels.length)" class="flex items-center gap-1 mt-1">
                <span
                  v-if="entry.category"
                  class="px-1.5 py-0.5 text-[10px] rounded-sm font-medium"
                  :style="{ color: hashColor(entry.category, 1), backgroundColor: hashColor(entry.category, 0.12) }"
                >{{ entry.category }}</span>
                <span
                  v-for="label in entry.labels" :key="label"
                  class="px-1.5 py-0.5 text-[10px] rounded-sm font-medium"
                  :style="{ color: hashColor(label, 1), backgroundColor: hashColor(label, 0.12) }"
                >{{ label }}</span>
              </div>
            </div>

            <!-- Time + dismiss -->
            <span class="text-xs text-white/25 flex-none mt-0.5" :title="new Date(entry.timestamp).toLocaleString()">{{ timeAgo(entry.timestamp) }}</span>
            <button
              class="opacity-0 group-hover:opacity-40 hover:!opacity-80 p-0.5 rounded hover:bg-white/5 flex-none transition-opacity"
              title="Dismiss"
              @click.stop="removeEntry(entry.id)"
            >
              <div class="i-carbon-trash-can w-3 h-3" />
            </button>
          </div>
        </div>
      </div>

      <!-- Detail panel -->
      <div v-if="selectedEntry" class="h-full overflow-y-auto border-l border-white/8 p-4">
        <!-- Header -->
        <div class="flex items-start gap-2 mb-3">
          <div class="flex-1">
            <div class="font-medium text-base text-white/90">
              {{ selectedEntry.message }}
            </div>
          </div>
          <button class="text-white/30 hover:text-white/70 p-1 transition" title="Dismiss" @click="removeEntry(selectedEntry.id)">
            <div class="i-carbon-trash-can w-4 h-4" />
          </button>
          <button class="text-white/30 hover:text-white/70 p-1 transition" title="Close" @click="selectedId = null">
            <div class="i-carbon-close w-4 h-4" />
          </button>
        </div>

        <!-- Metadata -->
        <div class="flex flex-wrap items-center gap-2 mb-3 text-xs">
          <span class="flex items-center gap-1" :class="levels[selectedEntry.level]?.color">
            <div :class="levels[selectedEntry.level]?.icon" class="w-3.5 h-3.5" />
            <span class="capitalize">{{ selectedEntry.level }}</span>
          </span>
          <span v-if="fromEntries[selectedEntry.from]" class="flex items-center gap-1" :class="fromEntries[selectedEntry.from]?.color">
            <div :class="fromEntries[selectedEntry.from]?.icon" class="w-3.5 h-3.5" />
            {{ fromEntries[selectedEntry.from]?.label }}
          </span>
          <span v-if="selectedEntry.status === 'loading'" class="flex items-center gap-1 text-amber-400">
            <div class="w-3 h-3 border-1.5 border-current border-t-transparent rounded-full animate-spin" />
            Loading
          </span>
          <span class="text-white/25" :title="new Date(selectedEntry.timestamp).toLocaleString()">{{ timeAgo(selectedEntry.timestamp) }}</span>
          <span v-if="selectedEntry.notify" class="flex items-center gap-0.5 text-white/30">
            <div class="i-carbon-notification w-3.5 h-3.5" />
            notify
          </span>
        </div>

        <!-- Description -->
        <div v-if="selectedEntry.description" class="text-sm text-white/60 mb-3 whitespace-pre-wrap">
          {{ selectedEntry.description }}
        </div>

        <!-- Category + Labels -->
        <div v-if="selectedEntry.category || (selectedEntry.labels && selectedEntry.labels.length)" class="flex flex-wrap gap-1 mb-3">
          <span
            v-if="selectedEntry.category"
            class="px-1.5 py-0.5 text-xs rounded-sm font-medium"
            :style="{ color: hashColor(selectedEntry.category, 1), backgroundColor: hashColor(selectedEntry.category, 0.15) }"
          >{{ selectedEntry.category }}</span>
          <span
            v-for="label in selectedEntry.labels" :key="label"
            class="px-1.5 py-0.5 text-xs rounded-sm font-medium"
            :style="{ color: hashColor(label, 1), backgroundColor: hashColor(label, 0.15) }"
          >{{ label }}</span>
        </div>

        <!-- File position -->
        <button
          v-if="selectedEntry.filePosition"
          class="flex items-center gap-1.5 text-sm text-blue-400 hover:underline mb-3"
          @click="call('rspack:open-in-editor', { path: selectedEntry.filePosition!.file, line: selectedEntry.filePosition!.line, column: selectedEntry.filePosition!.column })"
        >
          <div class="i-carbon-document w-4 h-4" />
          {{ selectedEntry.filePosition.file }}{{ selectedEntry.filePosition.line ? `:${selectedEntry.filePosition.line}` : '' }}
        </button>

        <!-- Element -->
        <div v-if="selectedEntry.elementPosition?.description || selectedEntry.elementPosition?.selector" class="text-sm mb-3 bg-white/3 rounded p-2">
          <div class="text-white/30 text-xs mb-1">
            Element
          </div>
          <div v-if="selectedEntry.elementPosition.selector" class="font-mono text-xs text-white/60">
            {{ selectedEntry.elementPosition.selector }}
          </div>
          <div v-if="selectedEntry.elementPosition.description" class="text-xs text-white/50 mt-1">
            {{ selectedEntry.elementPosition.description }}
          </div>
        </div>

        <!-- Stacktrace -->
        <div v-if="selectedEntry.stacktrace" class="mb-3">
          <div class="text-white/30 text-xs mb-1">
            Stack Trace
          </div>
          <pre class="text-xs bg-white/3 rounded p-2 overflow-x-auto whitespace-pre-wrap font-mono text-white/50">{{ selectedEntry.stacktrace }}</pre>
        </div>

        <!-- Timers -->
        <div v-if="selectedEntry.autoDismiss || selectedEntry.autoDelete" class="flex flex-wrap gap-3 mb-3 text-xs text-white/30">
          <span v-if="selectedEntry.autoDismiss" class="flex items-center gap-1">
            Auto-dismiss: {{ selectedEntry.autoDismiss / 1000 }}s
          </span>
          <span v-if="selectedEntry.autoDelete" class="flex items-center gap-1">
            Auto-delete: {{ selectedEntry.autoDelete / 1000 }}s
          </span>
        </div>

        <!-- ID + timestamp -->
        <div class="flex flex-col gap-1 text-xs text-white/20 font-mono border-t border-white/5 pt-3">
          <span>ID: {{ selectedEntry.id }}</span>
          <span>{{ new Date(selectedEntry.timestamp).toLocaleString() }}</span>
        </div>
      </div>
    </div>
  </div>
</template>
