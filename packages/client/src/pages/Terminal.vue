<script setup lang="ts">
import { useRpc } from '@/composables/rpc'
import { ref, onMounted, nextTick, watch } from 'vue'

const props = defineProps<{ session: any; sessionId: string }>()
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
  <div class="h-full flex flex-col">
    <div class="p-4 border-b border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900">
      <h1 class="text-xl font-bold flex items-center gap-2 mb-3">
        <div class="i-carbon-terminal text-green-500" /> Terminal
      </h1>
      <form class="flex gap-2" @submit.prevent="runCommand">
        <input v-model="command" class="input-base font-mono flex-1" placeholder="Enter command..." />
        <button type="submit" class="btn-primary">Run</button>
      </form>
    </div>

    <div class="flex flex-1 overflow-hidden">
      <!-- Terminal list -->
      <div class="w-48 border-r border-gray-200 dark:border-gray-800 overflow-auto bg-white dark:bg-gray-900">
        <div v-if="terminals.length === 0" class="p-4 text-sm text-gray-400 text-center">No terminals yet</div>
        <button v-for="t in terminals" :key="t.id"
          class="w-full text-left px-3 py-2 text-sm border-b border-gray-100 dark:border-gray-800 hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
          :class="selectedId === t.id ? 'bg-green-50 dark:bg-green-950/30 text-green-700 dark:text-green-300' : ''"
          @click="selectedId = t.id">
          <div class="flex items-center gap-2">
            <div :class="t.status === 'running' ? 'w-2 h-2 rounded-full bg-green-500 animate-pulse' : 'w-2 h-2 rounded-full bg-gray-400'" />
            <span class="truncate font-mono">{{ t.name }}</span>
          </div>
        </button>
      </div>

      <!-- Terminal output -->
      <div class="flex-1 bg-gray-950 text-green-400 overflow-auto">
        <pre v-if="selectedId" ref="terminalEl" class="p-4 font-mono text-xs whitespace-pre-wrap min-h-full">{{ terminalOutputs.get(selectedId) ?? terminals.find(t => t.id === selectedId)?.buffer ?? '' }}</pre>
        <div v-else class="flex items-center justify-center h-full text-gray-600">
          <div class="text-center">
            <div class="i-carbon-terminal text-4xl mb-2" />
            <p class="text-sm">Run a command to get started</p>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>
