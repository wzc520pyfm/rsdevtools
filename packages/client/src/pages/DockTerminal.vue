<script setup lang="ts">
import { useRpc } from '@/composables/rpc'
import { ref, onMounted, nextTick, watch } from 'vue'

const { call, terminalOutputs } = useRpc()

const terminals = ref<any[]>([])
const command = ref('')
const selectedId = ref<string | null>(null)
const terminalEl = ref<HTMLPreElement>()

onMounted(async () => {
  try { terminals.value = await call('rspack:get-terminals') } catch {}
})

async function runCommand() {
  if (!command.value.trim()) return
  try {
    const id = await call('rspack:run-terminal', { command: command.value })
    selectedId.value = id
    terminals.value = await call('rspack:get-terminals')
    command.value = ''
  } catch (e) {
    console.error('Failed to run command:', e)
  }
}

watch(() => terminalOutputs.value.get(selectedId.value ?? ''), () => {
  nextTick(() => {
    if (terminalEl.value) terminalEl.value.scrollTop = terminalEl.value.scrollHeight
  })
})
</script>

<template>
  <div class="h-screen flex flex-col bg-gray-50 dark:bg-gray-950 text-gray-900 dark:text-gray-100">
    <!-- Header -->
    <div class="px-4 py-3 border-b border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 shrink-0">
      <div class="flex items-center gap-2 mb-2">
        <div class="i-carbon-terminal text-lg text-green-500" />
        <h1 class="text-base font-semibold">Terminal</h1>
      </div>
      <form class="flex gap-2" @submit.prevent="runCommand">
        <input v-model="command" class="flex-1 px-2.5 py-1.5 text-sm rounded-md bg-gray-100 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 outline-none focus:border-green-400 font-mono transition-colors" placeholder="Enter command..." />
        <button type="submit" class="px-3 py-1.5 text-sm rounded-md bg-green-500 text-white hover:bg-green-600 transition-colors font-medium">Run</button>
      </form>
    </div>

    <div class="flex flex-1 overflow-hidden">
      <!-- Terminal list -->
      <div class="w-48 border-r border-gray-200 dark:border-gray-800 overflow-auto bg-white dark:bg-gray-900 shrink-0">
        <div v-if="terminals.length === 0" class="p-4 text-sm text-gray-400 text-center">No terminals</div>
        <button
          v-for="t in terminals" :key="t.id"
          class="w-full text-left px-3 py-2 text-sm border-b border-gray-100 dark:border-gray-800 hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
          :class="selectedId === t.id ? 'bg-green-50 dark:bg-green-950/30 text-green-700 dark:text-green-300' : ''"
          @click="selectedId = t.id"
        >
          <div class="flex items-center gap-2">
            <div :class="t.status === 'running' ? 'w-2 h-2 rounded-full bg-green-500 animate-pulse' : 'w-2 h-2 rounded-full bg-gray-400'" />
            <span class="truncate font-mono text-xs">{{ t.name }}</span>
          </div>
        </button>
      </div>

      <!-- Terminal output -->
      <div class="flex-1 bg-gray-950 text-green-400 overflow-auto">
        <pre v-if="selectedId" ref="terminalEl" class="p-4 font-mono text-xs whitespace-pre-wrap min-h-full">{{ terminalOutputs.get(selectedId) ?? terminals.find(t => t.id === selectedId)?.buffer ?? '' }}</pre>
        <div v-else class="flex items-center justify-center h-full text-gray-600">
          <div class="text-center">
            <div class="i-carbon-terminal text-4xl mb-2 opacity-50" />
            <p class="text-sm">Run a command to get started</p>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>
