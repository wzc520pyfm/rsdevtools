<script setup lang="ts">
import { useRpc } from '@/composables/rpc'
import { computed, onMounted, onUnmounted, ref } from 'vue'

const { call, onLogsUpdated } = useRpc()

interface LogEntry {
  id: string
  message: string
  level: 'info' | 'warn' | 'error' | 'success' | 'debug'
  description?: string
  from: 'server' | 'browser'
  timestamp: number
  notify?: boolean
  filePosition?: { file: string; line?: number; column?: number }
  elementPosition?: { selector?: string; description?: string }
  status?: 'loading' | 'idle'
  category?: string
  labels?: string[]
}

const entries = ref<LogEntry[]>([])
const entryMap = new Map<string, LogEntry>()
let lastVersion: number | undefined

const search = ref('')
const levelFilter = ref<string[]>([])
const fromFilter = ref<string[]>([])
const selectedId = ref<string | null>(null)
const sortOrder = ref<'newest' | 'oldest'>('newest')

const allLevels = ['info', 'warn', 'error', 'success', 'debug']
const allSources = ['server', 'browser']

async function updateLogs() {
  try {
    const result = await call('devtoolskit:internal:logs:list', lastVersion)

    for (const id of result.removedIds) {
      entryMap.delete(id)
    }
    for (const entry of result.entries) {
      entryMap.set(entry.id, entry)
    }

    entries.value = Array.from(entryMap.values())
    lastVersion = result.version
  }
  catch {}
}

const filteredEntries = computed(() => {
  let result = entries.value

  if (search.value) {
    const q = search.value.toLowerCase()
    result = result.filter(e =>
      e.message.toLowerCase().includes(q)
      || e.description?.toLowerCase().includes(q)
      || e.category?.toLowerCase().includes(q),
    )
  }

  if (levelFilter.value.length > 0) {
    result = result.filter(e => levelFilter.value.includes(e.level))
  }

  if (fromFilter.value.length > 0) {
    result = result.filter(e => fromFilter.value.includes(e.from))
  }

  result = [...result].sort((a, b) =>
    sortOrder.value === 'newest'
      ? b.timestamp - a.timestamp
      : a.timestamp - b.timestamp,
  )

  return result
})

const selectedEntry = computed(() =>
  selectedId.value ? entryMap.get(selectedId.value) ?? null : null,
)

const categories = computed(() => {
  const cats = new Set<string>()
  for (const e of entries.value) {
    if (e.category) cats.add(e.category)
  }
  return Array.from(cats)
})

function toggleLevel(level: string) {
  const idx = levelFilter.value.indexOf(level)
  if (idx >= 0) levelFilter.value.splice(idx, 1)
  else levelFilter.value.push(level)
}

function toggleFrom(from: string) {
  const idx = fromFilter.value.indexOf(from)
  if (idx >= 0) fromFilter.value.splice(idx, 1)
  else fromFilter.value.push(from)
}

async function clearAll() {
  try {
    await call('devtoolskit:internal:logs:clear')
    entryMap.clear()
    entries.value = []
    selectedId.value = null
    lastVersion = undefined
  }
  catch {}
}

async function removeEntry(id: string) {
  try {
    await call('devtoolskit:internal:logs:remove', id)
    entryMap.delete(id)
    entries.value = Array.from(entryMap.values())
    if (selectedId.value === id) selectedId.value = null
  }
  catch {}
}

function levelColor(level: string): string {
  switch (level) {
    case 'error': return 'text-red-500'
    case 'warn': return 'text-yellow-500'
    case 'success': return 'text-green-500'
    case 'debug': return 'text-gray-400'
    default: return 'text-blue-400'
  }
}

function levelBarColor(level: string): string {
  switch (level) {
    case 'error': return 'bg-red-500'
    case 'warn': return 'bg-yellow-500'
    case 'success': return 'bg-green-500'
    case 'debug': return 'bg-gray-400'
    default: return 'bg-blue-400'
  }
}

function levelIcon(level: string): string {
  switch (level) {
    case 'error': return 'i-carbon-error'
    case 'warn': return 'i-carbon-warning-alt'
    case 'success': return 'i-carbon-checkmark'
    case 'debug': return 'i-carbon-debug'
    default: return 'i-carbon-information'
  }
}

function formatTime(ts: number): string {
  return new Date(ts).toLocaleTimeString()
}

onMounted(() => {
  updateLogs()
})

const unsubscribe = onLogsUpdated(updateLogs)
onUnmounted(unsubscribe)
</script>

<template>
  <div class="h-screen flex flex-col bg-gray-50 dark:bg-gray-950 text-gray-900 dark:text-gray-100">
    <!-- Toolbar -->
    <div class="px-4 py-3 border-b border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 shrink-0 space-y-2">
      <!-- Row 1: Search + sort + actions -->
      <div class="flex items-center gap-2">
        <div class="i-carbon-notification text-lg text-blue-500" />
        <h1 class="text-base font-semibold mr-auto">
          Logs & Notifications
        </h1>
        <span class="text-xs text-gray-400">{{ filteredEntries.length }} / {{ entries.length }}</span>
      </div>
      <div class="flex items-center gap-2">
        <input
          v-model="search"
          class="flex-1 px-2.5 py-1 text-sm rounded-md bg-gray-100 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 outline-none focus:border-blue-400 transition-colors"
          placeholder="Search logs..."
        >
        <button
          class="px-2 py-1 text-xs rounded-md border border-gray-200 dark:border-gray-700 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
          @click="sortOrder = sortOrder === 'newest' ? 'oldest' : 'newest'"
        >
          {{ sortOrder === 'newest' ? '↓ Newest' : '↑ Oldest' }}
        </button>
        <button
          class="px-2 py-1 text-xs rounded-md text-red-500 border border-red-200 dark:border-red-800 hover:bg-red-50 dark:hover:bg-red-950 transition-colors"
          @click="clearAll"
        >
          Clear All
        </button>
      </div>
      <!-- Row 2: Filters -->
      <div class="flex items-center gap-3 text-xs">
        <span class="text-gray-400">Level:</span>
        <button
          v-for="level in allLevels" :key="level"
          class="px-1.5 py-0.5 rounded transition-colors"
          :class="levelFilter.length === 0 || levelFilter.includes(level) ? `${levelColor(level)} bg-gray-100 dark:bg-gray-800` : 'text-gray-400 opacity-50'"
          @click="toggleLevel(level)"
        >
          {{ level }}
        </button>
        <span class="text-gray-300">|</span>
        <span class="text-gray-400">Source:</span>
        <button
          v-for="from in allSources" :key="from"
          class="px-1.5 py-0.5 rounded transition-colors"
          :class="fromFilter.length === 0 || fromFilter.includes(from) ? 'text-gray-200 bg-gray-100 dark:bg-gray-800' : 'text-gray-400 opacity-50'"
          @click="toggleFrom(from)"
        >
          {{ from }}
        </button>
      </div>
    </div>

    <!-- Content -->
    <div class="flex-1 overflow-hidden" :class="selectedEntry ? 'grid grid-cols-[1fr_1fr]' : ''">
      <!-- Log list -->
      <div class="h-full overflow-y-auto">
        <div v-if="filteredEntries.length === 0" class="flex items-center justify-center h-full text-gray-400">
          <div class="text-center">
            <div class="i-carbon-notification text-4xl mb-2 opacity-50" />
            <p class="text-sm">
              No logs yet
            </p>
          </div>
        </div>
        <div
          v-for="entry in filteredEntries" :key="entry.id"
          class="flex items-stretch border-b border-gray-100 dark:border-gray-800 cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-900 transition-colors"
          :class="selectedId === entry.id ? 'bg-blue-50 dark:bg-blue-950/30' : ''"
          @click="selectedId = selectedId === entry.id ? null : entry.id"
        >
          <!-- Level bar -->
          <div class="w-1 shrink-0" :class="levelBarColor(entry.level)" />
          <!-- Content -->
          <div class="flex-1 px-3 py-2 min-w-0">
            <div class="flex items-center gap-2">
              <div :class="[levelIcon(entry.level), levelColor(entry.level)]" class="text-sm shrink-0" />
              <span v-if="entry.status === 'loading'" class="i-carbon-renew animate-spin text-xs text-blue-400 shrink-0" />
              <span class="text-sm truncate">{{ entry.message }}</span>
              <span class="ml-auto text-xs text-gray-400 shrink-0">{{ formatTime(entry.timestamp) }}</span>
            </div>
            <div v-if="entry.description" class="text-xs text-gray-400 mt-0.5 truncate">
              {{ entry.description }}
            </div>
            <div v-if="entry.category || (entry.labels && entry.labels.length)" class="flex items-center gap-1 mt-1">
              <span v-if="entry.category" class="px-1.5 py-0.5 text-[10px] rounded bg-gray-200 dark:bg-gray-700 text-gray-600 dark:text-gray-300">{{ entry.category }}</span>
              <span v-for="label in entry.labels" :key="label" class="px-1.5 py-0.5 text-[10px] rounded bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-300">{{ label }}</span>
            </div>
          </div>
        </div>
      </div>

      <!-- Detail panel -->
      <div v-if="selectedEntry" class="h-full overflow-y-auto border-l border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900">
        <div class="p-4 space-y-4">
          <!-- Header -->
          <div class="flex items-center justify-between">
            <div class="flex items-center gap-2">
              <div :class="[levelIcon(selectedEntry.level), levelColor(selectedEntry.level)]" />
              <span class="font-semibold text-sm">{{ selectedEntry.message }}</span>
            </div>
            <button class="text-xs text-red-400 hover:text-red-500" @click="removeEntry(selectedEntry.id)">
              Remove
            </button>
          </div>

          <!-- Metadata -->
          <div class="grid grid-cols-2 gap-2 text-xs">
            <div>
              <span class="text-gray-400">Level:</span>
              <span :class="levelColor(selectedEntry.level)" class="ml-1 capitalize">{{ selectedEntry.level }}</span>
            </div>
            <div>
              <span class="text-gray-400">Source:</span>
              <span class="ml-1">{{ selectedEntry.from }}</span>
            </div>
            <div>
              <span class="text-gray-400">Time:</span>
              <span class="ml-1">{{ new Date(selectedEntry.timestamp).toLocaleString() }}</span>
            </div>
            <div v-if="selectedEntry.status">
              <span class="text-gray-400">Status:</span>
              <span class="ml-1">{{ selectedEntry.status }}</span>
            </div>
          </div>

          <!-- Description -->
          <div v-if="selectedEntry.description">
            <div class="text-xs text-gray-400 mb-1">
              Description
            </div>
            <div class="text-sm bg-gray-50 dark:bg-gray-800 rounded p-2 whitespace-pre-wrap">
              {{ selectedEntry.description }}
            </div>
          </div>

          <!-- File position -->
          <div v-if="selectedEntry.filePosition">
            <div class="text-xs text-gray-400 mb-1">
              File
            </div>
            <button
              class="text-sm text-blue-500 hover:underline"
              @click="call('rspack:open-in-editor', { path: selectedEntry.filePosition!.file, line: selectedEntry.filePosition!.line, column: selectedEntry.filePosition!.column })"
            >
              {{ selectedEntry.filePosition.file }}{{ selectedEntry.filePosition.line ? `:${selectedEntry.filePosition.line}` : '' }}
            </button>
          </div>

          <!-- Element position -->
          <div v-if="selectedEntry.elementPosition?.description">
            <div class="text-xs text-gray-400 mb-1">
              Element
            </div>
            <div class="text-sm font-mono bg-gray-50 dark:bg-gray-800 rounded p-2">
              {{ selectedEntry.elementPosition.description }}
            </div>
          </div>

          <!-- Category & Labels -->
          <div v-if="selectedEntry.category || (selectedEntry.labels && selectedEntry.labels.length)">
            <div class="text-xs text-gray-400 mb-1">
              Tags
            </div>
            <div class="flex flex-wrap gap-1">
              <span v-if="selectedEntry.category" class="px-2 py-0.5 text-xs rounded bg-gray-200 dark:bg-gray-700">{{ selectedEntry.category }}</span>
              <span v-for="label in selectedEntry.labels" :key="label" class="px-2 py-0.5 text-xs rounded bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-300">{{ label }}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>
