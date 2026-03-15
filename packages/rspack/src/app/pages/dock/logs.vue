<script setup lang="ts">
import { useRpc } from '../../composables/rpc'
import { computed, onMounted, onUnmounted, ref } from 'vue'

interface LogEntry {
  id: string
  message: string
  level: 'info' | 'warn' | 'error' | 'success' | 'debug'
  description?: string
  from: 'server' | 'browser'
  timestamp: number
  category?: string
  labels?: string[]
  status?: 'loading' | 'idle'
}

const { call } = useRpc()
const logs = ref<LogEntry[]>([])
const selected = ref<LogEntry | null>(null)
const search = ref('')
const filterLevel = ref<string>('all')
let syncVersion = 0
let pollTimer: ReturnType<typeof setInterval> | null = null

async function fetchLogs(since?: number) {
  try {
    const result = await call('devtoolskit:internal:logs:list', since)
    if (since === undefined) {
      logs.value = result.entries
    } else {
      for (const id of result.removedIds) {
        const idx = logs.value.findIndex(e => e.id === id)
        if (idx >= 0) logs.value.splice(idx, 1)
      }
      for (const entry of result.entries) {
        const idx = logs.value.findIndex(e => e.id === entry.id)
        if (idx >= 0) logs.value[idx] = entry
        else logs.value.push(entry)
      }
    }
    syncVersion = result.version
  } catch {}
}

async function clearAll() {
  await call('devtoolskit:internal:logs:clear')
  logs.value = []
  selected.value = null
}

async function removeLog(id: string) {
  await call('devtoolskit:internal:logs:remove', id)
  logs.value = logs.value.filter(e => e.id !== id)
  if (selected.value?.id === id) selected.value = null
}

const filteredLogs = computed(() => {
  let items = logs.value
  if (filterLevel.value !== 'all') {
    items = items.filter(e => e.level === filterLevel.value)
  }
  if (search.value) {
    const q = search.value.toLowerCase()
    items = items.filter(e => e.message.toLowerCase().includes(q) || e.description?.toLowerCase().includes(q))
  }
  return items.sort((a, b) => b.timestamp - a.timestamp)
})

function levelIcon(level: string) {
  switch (level) {
    case 'error': return 'i-ph-x-circle text-red-400'
    case 'warn': return 'i-ph-warning text-amber-400'
    case 'success': return 'i-ph-check-circle text-green-400'
    case 'debug': return 'i-ph-bug text-violet-400'
    default: return 'i-ph-info text-blue-400'
  }
}

function formatTime(ts: number) {
  return new Date(ts).toLocaleTimeString()
}

onMounted(() => {
  fetchLogs()
  pollTimer = setInterval(() => fetchLogs(syncVersion), 2000)
})
onUnmounted(() => { if (pollTimer) clearInterval(pollTimer) })
</script>

<template>
  <div class="h-screen w-full flex flex-col bg-[#1a1a2e] text-white/85">
    <div class="px-4 py-3 border-b border-white/8 shrink-0">
      <div class="flex items-center gap-2 mb-2">
        <div class="i-ph-notification-duotone text-lg text-blue-400" />
        <h1 class="text-base font-semibold mr-auto text-white/80">Logs & Notifications</h1>
        <span class="text-xs text-white/30">{{ filteredLogs.length }} entries</span>
        <button
          class="px-2.5 py-1 text-xs rounded-md border border-white/10 text-white/40 hover:text-red-400 hover:bg-red-400/5 transition-colors"
          @click="clearAll"
        >
          Clear All
        </button>
      </div>
      <div class="flex items-center gap-2">
        <input
          v-model="search"
          class="flex-1 px-2.5 py-1.5 text-xs rounded-md bg-transparent border border-white/10 outline-none focus:border-blue-400/50 text-white/80 placeholder-white/25"
          placeholder="Search logs..."
        >
        <select
          v-model="filterLevel"
          class="px-2 py-1.5 text-xs rounded-md bg-transparent border border-white/10 text-white/60 outline-none"
        >
          <option value="all">All</option>
          <option value="error">Error</option>
          <option value="warn">Warn</option>
          <option value="info">Info</option>
          <option value="success">Success</option>
          <option value="debug">Debug</option>
        </select>
      </div>
    </div>

    <div class="flex-1 flex overflow-hidden">
      <div class="flex-1 overflow-y-auto">
        <div v-if="filteredLogs.length === 0" class="text-sm text-white/25 text-center py-12">
          No log entries
        </div>
        <div
          v-for="entry in filteredLogs" :key="entry.id"
          class="flex items-start gap-3 px-4 py-3 border-b border-white/5 hover:bg-white/[0.02] cursor-pointer transition-colors"
          :class="selected?.id === entry.id ? 'bg-white/[0.04]' : ''"
          @click="selected = entry"
        >
          <div :class="levelIcon(entry.level)" class="text-base mt-0.5 shrink-0" />
          <div class="flex-1 min-w-0">
            <div class="text-sm text-white/80 truncate">{{ entry.message }}</div>
            <div v-if="entry.description" class="text-xs text-white/35 truncate mt-0.5">{{ entry.description }}</div>
            <div class="flex items-center gap-2 mt-1">
              <span class="text-[10px] text-white/20">{{ formatTime(entry.timestamp) }}</span>
              <span v-if="entry.category" class="text-[10px] px-1 rounded bg-white/5 text-white/30">{{ entry.category }}</span>
              <span class="text-[10px] text-white/20">{{ entry.from }}</span>
            </div>
          </div>
          <button
            class="text-white/20 hover:text-red-400 shrink-0 p-1 transition-colors"
            title="Remove"
            @click.stop="removeLog(entry.id)"
          >
            <div class="i-ph-x text-xs" />
          </button>
        </div>
      </div>

      <div v-if="selected" class="w-80 border-l border-white/8 overflow-y-auto p-4 shrink-0">
        <div class="flex items-center gap-2 mb-3">
          <div :class="levelIcon(selected.level)" class="text-lg" />
          <span class="text-xs font-medium uppercase text-white/50">{{ selected.level }}</span>
        </div>
        <div class="text-sm text-white/85 mb-2">{{ selected.message }}</div>
        <div v-if="selected.description" class="text-xs text-white/50 mb-3">{{ selected.description }}</div>
        <div class="space-y-2 text-xs">
          <div class="flex justify-between">
            <span class="text-white/30">ID</span>
            <span class="font-mono text-white/50">{{ selected.id }}</span>
          </div>
          <div class="flex justify-between">
            <span class="text-white/30">Time</span>
            <span class="text-white/50">{{ new Date(selected.timestamp).toLocaleString() }}</span>
          </div>
          <div class="flex justify-between">
            <span class="text-white/30">Source</span>
            <span class="text-white/50">{{ selected.from }}</span>
          </div>
          <div v-if="selected.category" class="flex justify-between">
            <span class="text-white/30">Category</span>
            <span class="text-white/50">{{ selected.category }}</span>
          </div>
          <div v-if="selected.labels?.length" class="flex justify-between">
            <span class="text-white/30">Labels</span>
            <span class="text-white/50">{{ selected.labels.join(', ') }}</span>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>
