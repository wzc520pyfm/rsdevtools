<script setup lang="ts">
import { useRpc } from '../../composables/rpc'
import { nextTick, onMounted, onUnmounted, ref, watch } from 'vue'

interface TerminalSession {
  id: string
  name: string
  command: string
  cwd: string
  status: 'running' | 'exited'
  exitCode?: number
  startTime: number
  endTime?: number
}

const { call } = useRpc()
const sessions = ref<TerminalSession[]>([])
const activeSession = ref<string | null>(null)
const buffers = ref<Map<string, string>>(new Map())
const outputEl = ref<HTMLPreElement | null>(null)
let pollTimer: ReturnType<typeof setInterval> | null = null

async function fetchSessions() {
  try {
    const list = await call('devtoolskit:internal:terminals:list')
    sessions.value = list
    if (!activeSession.value && list.length > 0) {
      activeSession.value = list[0].id
    }
  } catch {}
}

async function loadBuffer(id: string) {
  if (buffers.value.has(id)) return
  try {
    const buf = await call('devtoolskit:internal:terminals:read', id)
    buffers.value.set(id, buf)
    buffers.value = new Map(buffers.value)
  } catch {}
}

function formatDuration(session: TerminalSession) {
  const end = session.endTime ?? Date.now()
  const ms = end - session.startTime
  if (ms < 1000) return `${ms}ms`
  if (ms < 60000) return `${(ms / 1000).toFixed(1)}s`
  return `${(ms / 60000).toFixed(1)}m`
}

watch(activeSession, async (id) => {
  if (id) {
    await loadBuffer(id)
    await nextTick()
    if (outputEl.value) {
      outputEl.value.scrollTop = outputEl.value.scrollHeight
    }
  }
})

onMounted(() => {
  fetchSessions()
  pollTimer = setInterval(async () => {
    await fetchSessions()
    if (activeSession.value) {
      try {
        const buf = await call('devtoolskit:internal:terminals:read', activeSession.value)
        buffers.value.set(activeSession.value, buf)
        buffers.value = new Map(buffers.value)
      } catch {}
    }
  }, 3000)
})
onUnmounted(() => { if (pollTimer) clearInterval(pollTimer) })
</script>

<template>
  <div class="h-screen w-full flex flex-col bg-[#0d1117] text-white/85">
    <div v-if="sessions.length === 0" class="flex-1 flex items-center justify-center">
      <div class="text-center">
        <div class="i-ph-terminal-duotone text-4xl text-white/15 mx-auto mb-3" />
        <p class="text-sm text-white/25">No terminal sessions</p>
      </div>
    </div>

    <template v-else>
      <!-- Tab bar -->
      <div class="flex items-center border-b border-white/8 shrink-0 overflow-x-auto">
        <button
          v-for="session in sessions" :key="session.id"
          class="flex items-center gap-2 px-4 py-2.5 text-xs border-r border-white/5 whitespace-nowrap transition-colors"
          :class="activeSession === session.id ? 'bg-white/[0.04] text-white/80' : 'text-white/40 hover:text-white/60 hover:bg-white/[0.02]'"
          @click="activeSession = session.id"
        >
          <div
            class="w-2 h-2 rounded-full shrink-0"
            :class="session.status === 'running' ? 'bg-green-400' : session.exitCode === 0 ? 'bg-white/20' : 'bg-red-400'"
          />
          <span class="truncate max-w-40">{{ session.name }}</span>
          <span class="text-[10px] text-white/20">{{ formatDuration(session) }}</span>
        </button>
      </div>

      <!-- Terminal output -->
      <pre
        ref="outputEl"
        class="flex-1 overflow-auto p-4 text-xs font-mono leading-relaxed text-green-300/80 whitespace-pre-wrap break-all"
      >{{ activeSession ? buffers.get(activeSession) || 'Loading...' : '' }}</pre>
    </template>
  </div>
</template>
