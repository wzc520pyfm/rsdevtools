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
    if (!activeSession.value && list.length > 0)
      activeSession.value = list[0].id
  }
  catch {}
}

async function loadBuffer(id: string) {
  if (buffers.value.has(id))
    return
  try {
    const buf = await call('devtoolskit:internal:terminals:read', id)
    buffers.value.set(id, buf)
    buffers.value = new Map(buffers.value)
  }
  catch {}
}

function formatDuration(session: TerminalSession) {
  const end = session.endTime ?? Date.now()
  const ms = end - session.startTime
  if (ms < 1000)
    return `${ms}ms`
  if (ms < 60000)
    return `${(ms / 1000).toFixed(1)}s`
  return `${(ms / 60000).toFixed(1)}m`
}

watch(activeSession, async (id) => {
  if (id) {
    await loadBuffer(id)
    await nextTick()
    if (outputEl.value)
      outputEl.value.scrollTop = outputEl.value.scrollHeight
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
      }
      catch {}
    }
  }, 3000)
})
onUnmounted(() => { if (pollTimer) clearInterval(pollTimer) })
</script>

<template>
  <div class="w-full h-full grid grid-rows-[max-content_1fr]">
    <div v-if="sessions.length === 0" class="flex items-center justify-center h-full">
      <div class="text-center">
        <div class="i-ph-terminal-duotone text-4xl op15 mx-auto mb-3" />
        <p class="text-sm op40">No terminal sessions</p>
      </div>
    </div>

    <template v-else>
      <!-- Tab bar -->
      <div class="border-base border-b rounded-t overflow-x-auto">
        <button
          v-for="session in sessions"
          :key="session.id"
          class="px3 py1.5 border-r border-base hover:bg-active text-sm flex items-center gap-1"
          :class="activeSession === session.id ? 'bg-active' : ''"
          @click="activeSession = session.id"
        >
          <div class="i-ph-terminal-duotone w-4 h-4" />
          <span>{{ session.name }}</span>
          <span class="text-xs op30 ml-1">{{ formatDuration(session) }}</span>
          <div
            class="w-2 h-2 rounded-full shrink-0 ml-1"
            :class="session.status === 'running' ? 'bg-green' : session.exitCode === 0 ? 'bg-gray/30' : 'bg-red'"
          />
        </button>
      </div>

      <!-- Terminal output -->
      <div class="h-full w-full flex relative">
        <pre
          ref="outputEl"
          class="flex-1 of-auto p-4 text-xs font-mono leading-relaxed whitespace-pre-wrap break-all bg-black"
        >{{ activeSession ? buffers.get(activeSession) || 'Loading...' : '' }}</pre>
      </div>
    </template>
  </div>
</template>
