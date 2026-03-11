<script setup lang="ts">
import { useRpc, formatDuration } from '@/composables/rpc'
import { ref, onMounted, watch } from 'vue'
import { useRouter } from 'vue-router'

const { call, buildNotification } = useRpc()
const router = useRouter()

interface SessionInfo {
  id: string
  timestamp: number
  duration: number
  hash: string
}

const sessions = ref<SessionInfo[]>([])
const loading = ref(true)

async function loadSessions() {
  loading.value = true
  try {
    sessions.value = await call('rspack:list-sessions')
  } catch (e) {
    console.error('Failed to load sessions:', e)
  }
  loading.value = false
}

onMounted(loadSessions)

watch(buildNotification, () => {
  if (buildNotification.value) {
    loadSessions()
  }
})

function selectSession(session: SessionInfo) {
  router.push(`/session/${session.id}`)
}

function formatTime(ts: number) {
  return new Date(ts).toLocaleString()
}
</script>

<template>
  <div class="flex flex-col items-center justify-center min-h-screen p-8">
    <div class="text-center mb-12">
      <div class="flex items-center justify-center gap-3 mb-4">
        <div class="i-carbon-cube text-4xl text-blue-500" />
        <h1 class="text-4xl font-bold bg-gradient-to-r from-blue-500 to-cyan-400 bg-clip-text text-transparent">
          Rspack DevTools
        </h1>
      </div>
      <p class="text-gray-500 dark:text-gray-400 text-lg">
        Build analysis and visualization for Rspack
      </p>
    </div>

    <div v-if="loading" class="flex items-center gap-2 text-gray-400">
      <div class="i-carbon-renew animate-spin" />
      Loading sessions...
    </div>

    <div v-else-if="sessions.length === 0" class="text-center">
      <div class="i-carbon-document-unknown text-6xl text-gray-300 dark:text-gray-700 mb-4" />
      <p class="text-gray-500 dark:text-gray-400 text-lg">No build sessions yet</p>
      <p class="text-gray-400 dark:text-gray-500 text-sm mt-2">Run a build to get started</p>
    </div>

    <div v-else class="w-full max-w-2xl">
      <p class="text-gray-500 dark:text-gray-400 mb-4 text-center">
        Select a build session to inspect:
      </p>
      <div class="flex flex-col gap-3">
        <button
          v-for="session in sessions"
          :key="session.id"
          class="card p-4 text-left hover:border-blue-400 dark:hover:border-blue-600 transition-all hover:shadow-md group cursor-pointer"
          @click="selectSession(session)"
        >
          <div class="flex items-center justify-between">
            <div class="flex items-center gap-3">
              <div class="i-carbon-build text-xl text-blue-500 group-hover:scale-110 transition-transform" />
              <div>
                <div class="font-mono text-sm font-medium">{{ session.id }}</div>
                <div class="text-xs text-gray-400 mt-0.5">{{ formatTime(session.timestamp) }}</div>
              </div>
            </div>
            <div class="flex items-center gap-4">
              <div class="text-right">
                <div class="text-sm font-medium">{{ formatDuration(session.duration) }}</div>
                <div class="text-xs text-gray-400">duration</div>
              </div>
              <div class="badge-gray font-mono text-xs">
                {{ session.hash.slice(0, 8) }}
              </div>
              <div class="i-carbon-chevron-right text-gray-400 group-hover:text-blue-500 transition-colors" />
            </div>
          </div>
        </button>
      </div>
    </div>
  </div>
</template>
