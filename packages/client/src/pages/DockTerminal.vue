<script setup lang="ts">
import { useRpc } from '@/composables/rpc'
import { nextTick, onMounted, ref, watch } from 'vue'

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
  }
  catch (e) {
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
  <div class="h-screen flex flex-col bg-[#1a1a2e] text-white/85">
    <!-- Header -->
    <div class="px-4 py-3 border-b border-white/8 shrink-0">
      <div class="flex items-center gap-2 mb-3">
        <div class="i-carbon-terminal text-lg text-green-400" />
        <h1 class="text-base font-semibold text-white/80">
          Terminal
        </h1>
      </div>
      <form class="flex gap-2" @submit.prevent="runCommand">
        <input
          v-model="command"
          class="flex-1 px-2.5 py-1.5 text-xs rounded-md bg-transparent border border-white/10 outline-none focus:border-green-400/50 font-mono text-white/80 placeholder-white/25 transition-colors"
          placeholder="Enter command..."
        >
        <button
          type="submit"
          class="px-3 py-1.5 text-xs rounded-md bg-green-500/15 text-green-400 hover:bg-green-500/25 transition-colors font-medium border border-green-500/20"
        >
          Run
        </button>
      </form>
    </div>

    <div class="flex flex-1 overflow-hidden">
      <!-- Terminal list -->
      <div class="w-48 border-r border-white/8 overflow-auto shrink-0">
        <div v-if="terminals.length === 0" class="p-4 text-sm text-white/25 text-center">
          No terminals
        </div>
        <button
          v-for="t in terminals" :key="t.id"
          class="w-full text-left px-3 py-2.5 text-sm border-b border-white/5 hover:bg-white/[0.03] transition-colors"
          :class="selectedId === t.id ? 'bg-green-500/8 text-green-400' : 'text-white/60'"
          @click="selectedId = t.id"
        >
          <div class="flex items-center gap-2">
            <div :class="t.status === 'running' ? 'w-2 h-2 rounded-full bg-green-400 animate-pulse' : 'w-2 h-2 rounded-full bg-white/20'" />
            <span class="truncate font-mono text-xs">{{ t.name }}</span>
          </div>
        </button>
      </div>

      <!-- Terminal output -->
      <div class="flex-1 bg-[#0d0d1a] overflow-auto">
        <pre v-if="selectedId" ref="terminalEl" class="p-4 font-mono text-xs whitespace-pre-wrap min-h-full text-green-400/80">{{ terminalOutputs.get(selectedId) ?? terminals.find(t => t.id === selectedId)?.buffer ?? '' }}</pre>
        <div v-else class="flex items-center justify-center h-full text-white/20">
          <div class="text-center">
            <div class="i-carbon-terminal text-4xl mb-2 opacity-30" />
            <p class="text-sm">
              Run a command to get started
            </p>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>
