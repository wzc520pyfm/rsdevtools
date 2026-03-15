<script setup lang="ts">
import { useRpc, formatDuration } from '@/composables/rpc'
import { ref, computed, onMounted, watch } from 'vue'
import { useRouter } from 'vue-router'

const { call, buildNotification } = useRpc()
const router = useRouter()

interface SessionInfo { id: string; timestamp: number; duration: number; hash: string }

const sessions = ref<SessionInfo[]>([])
const loading = ref(true)
const mode = ref<'list' | 'compare'>('list')
const selected = ref<SessionInfo[]>([])
const selectedIds = computed(() => selected.value.map(s => s.id).sort())

async function loadSessions() {
  loading.value = true
  try { sessions.value = await call('rspack:list-sessions') } catch {}
  loading.value = false
}

onMounted(loadSessions)
watch(buildNotification, () => { if (buildNotification.value) loadSessions() })

function handleClick(s: SessionInfo) {
  if (mode.value === 'list') {
    router.push(`/session/${s.id}`)
  } else {
    if (selectedIds.value.includes(s.id)) {
      selected.value = selected.value.filter(x => x.id !== s.id)
    } else if (selected.value.length < 2) {
      selected.value = [...selected.value, s]
    }
  }
}

function goCompare() {
  if (selected.value.length === 2) {
    router.push(`/compare/${selectedIds.value.join(',')}`)
  }
}

function formatTime(ts: number) { return new Date(ts).toLocaleString() }
</script>

<template>
  <div class="flex flex-col items-center justify-center min-h-screen p-8">
    <div class="text-center mb-12">
      <div class="flex items-center justify-center gap-3 mb-4">
        <div class="i-carbon-cube text-4xl text-blue-500" />
        <h1 class="text-4xl font-bold bg-gradient-to-r from-blue-500 to-cyan-400 bg-clip-text text-transparent">Rspack DevTools</h1>
      </div>
      <p class="text-gray-500 dark:text-gray-400 text-lg">Build analysis and visualization for Rspack</p>
    </div>

    <div v-if="loading" class="flex items-center gap-2 text-gray-400">
      <div class="i-carbon-renew animate-spin" /> Loading sessions...
    </div>

    <div v-else-if="sessions.length === 0" class="text-center">
      <div class="i-carbon-document-unknown text-6xl text-gray-300 dark:text-gray-700 mb-4" />
      <p class="text-gray-500 text-lg">No build sessions yet</p>
      <p class="text-gray-400 text-sm mt-2">Run a build to get started</p>
    </div>

    <div v-else class="w-full max-w-2xl">
      <p class="text-gray-500 dark:text-gray-400 mb-4 text-center">
        {{ mode === 'list' ? 'Select a build session to inspect:' : 'Select 2 sessions to compare:' }}
      </p>

      <!-- Mode toggle -->
      <div class="flex justify-center mb-4">
        <div class="flex border border-gray-200 dark:border-gray-700 rounded-lg overflow-hidden">
          <button class="px-4 py-1.5 text-sm" :class="mode === 'list' ? 'bg-blue-500 text-white' : 'btn-ghost'" @click="mode = 'list'; selected = []">
            <div class="i-carbon-list-bulleted mr-1 inline-block align-middle" /> List
          </button>
          <button class="px-4 py-1.5 text-sm" :class="mode === 'compare' ? 'bg-blue-500 text-white' : 'btn-ghost'" @click="mode = 'compare'; selected = []">
            <div class="i-carbon-compare mr-1 inline-block align-middle" /> Compare
          </button>
        </div>
      </div>

      <div class="flex flex-col gap-3">
        <button
          v-for="s in sessions" :key="s.id"
          class="card p-4 text-left transition-all group cursor-pointer"
          :class="[
            selectedIds.includes(s.id) ? 'border-blue-400 dark:border-blue-600 shadow-md ring-2 ring-blue-200 dark:ring-blue-900' : 'hover:border-blue-400 dark:hover:border-blue-600 hover:shadow-md',
          ]"
          @click="handleClick(s)"
        >
          <div class="flex items-center justify-between">
            <div class="flex items-center gap-3">
              <div v-if="mode === 'compare'" class="w-5 h-5 rounded border-2 flex items-center justify-center shrink-0"
                :class="selectedIds.includes(s.id) ? 'border-blue-500 bg-blue-500' : 'border-gray-300 dark:border-gray-600'">
                <div v-if="selectedIds.includes(s.id)" class="i-carbon-checkmark text-white text-xs" />
              </div>
              <div class="i-carbon-build text-xl text-blue-500 group-hover:scale-110 transition-transform" />
              <div>
                <div class="font-mono text-sm font-medium">{{ s.id }}</div>
                <div class="text-xs text-gray-400 mt-0.5">{{ formatTime(s.timestamp) }}</div>
              </div>
            </div>
            <div class="flex items-center gap-4">
              <div class="text-right">
                <div class="text-sm font-medium">{{ formatDuration(s.duration) }}</div>
                <div class="text-xs text-gray-400">duration</div>
              </div>
              <div class="badge-gray font-mono text-xs">{{ s.hash.slice(0, 8) }}</div>
              <div v-if="mode === 'list'" class="i-carbon-chevron-right text-gray-400 group-hover:text-blue-500 transition-colors" />
            </div>
          </div>
        </button>
      </div>

      <!-- Compare action -->
      <div v-if="mode === 'compare' && selected.length > 0" class="fixed bottom-6 left-1/2 -translate-x-1/2 card p-4 shadow-xl z-50">
        <div class="flex items-center gap-4">
          <span class="text-sm text-gray-500">{{ selected.length }}/2 selected</span>
          <button v-if="selected.length === 2" class="btn-primary" @click="goCompare">Compare Sessions</button>
          <span v-else class="text-sm text-gray-400">Select one more session</span>
        </div>
      </div>
    </div>
  </div>
</template>
