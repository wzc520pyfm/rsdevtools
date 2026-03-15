<script setup lang="ts">
import { onMounted, ref } from 'vue'
import { useRpc } from '../../composables/rpc'

interface DockEntry {
  id: string
  title: string
  type: string
  icon?: string
  category?: string
  isHidden?: boolean
}

const { call } = useRpc()
const docks = ref<DockEntry[]>([])
const hiddenDocks = ref<Set<string>>(new Set())
const showIframeAddressBar = ref(false)
const closeOnOutsideClick = ref(false)

async function loadSettings() {
  try {
    const allDocks = await call('devtoolskit:self-inspect:get-docks')
    docks.value = allDocks
  } catch {}
}

function toggleDockVisibility(id: string) {
  if (hiddenDocks.value.has(id)) {
    hiddenDocks.value.delete(id)
  } else {
    hiddenDocks.value.add(id)
  }
  hiddenDocks.value = new Set(hiddenDocks.value)
}

function resetSettings() {
  hiddenDocks.value = new Set()
  showIframeAddressBar.value = false
  closeOnOutsideClick.value = false
}

onMounted(loadSettings)
</script>

<template>
  <div class="h-screen w-full flex flex-col bg-[#1a1a2e] text-white/85">
    <div class="px-4 py-3 border-b border-white/8 shrink-0">
      <div class="flex items-center gap-2">
        <div class="i-ph-gear-duotone text-lg text-white/50" />
        <h1 class="text-base font-semibold mr-auto text-white/80">Settings</h1>
        <button
          class="px-2.5 py-1 text-xs rounded-md border border-white/10 text-white/40 hover:text-white/70 hover:bg-white/5 transition-colors"
          @click="resetSettings"
        >
          Reset
        </button>
      </div>
    </div>

    <div class="flex-1 overflow-y-auto p-4 space-y-6">
      <!-- Dock Entries -->
      <section>
        <h2 class="text-sm font-medium text-white/50 mb-3">Dock Entries</h2>
        <div class="border border-white/8 rounded-lg overflow-hidden">
          <div
            v-for="(dock, i) in docks" :key="dock.id"
            class="flex items-center gap-3 px-3 py-2.5 hover:bg-white/[0.02] transition-colors"
            :class="i < docks.length - 1 ? 'border-b border-white/5' : ''"
          >
            <button
              class="w-5 h-5 rounded border flex items-center justify-center shrink-0 transition-colors"
              :class="hiddenDocks.has(dock.id) ? 'border-white/10 bg-transparent' : 'border-blue-400/50 bg-blue-400/15'"
              @click="toggleDockVisibility(dock.id)"
            >
              <div v-if="!hiddenDocks.has(dock.id)" class="i-ph-check text-xs text-blue-400" />
            </button>
            <div class="flex-1 min-w-0">
              <div class="text-sm text-white/75 truncate" :class="hiddenDocks.has(dock.id) ? 'opacity-40' : ''">{{ dock.title }}</div>
              <div class="text-[11px] font-mono text-white/20">{{ dock.id }}</div>
            </div>
            <span v-if="dock.category" class="text-[10px] px-1.5 py-0.5 rounded bg-white/5 text-white/25">{{ dock.category }}</span>
          </div>
        </div>
        <p v-if="docks.length === 0" class="text-sm text-white/25 text-center py-4">
          No dock entries
        </p>
      </section>

      <!-- Appearance -->
      <section>
        <h2 class="text-sm font-medium text-white/50 mb-3">Appearance</h2>
        <div class="space-y-3">
          <label class="flex items-center gap-3 cursor-pointer">
            <input
              v-model="showIframeAddressBar"
              type="checkbox"
              class="w-4 h-4 rounded border border-white/15 bg-transparent accent-blue-400"
            >
            <div>
              <div class="text-sm text-white/70">Show iframe address bar</div>
              <div class="text-xs text-white/30">Display the URL bar for iframe dock views</div>
            </div>
          </label>
          <label class="flex items-center gap-3 cursor-pointer">
            <input
              v-model="closeOnOutsideClick"
              type="checkbox"
              class="w-4 h-4 rounded border border-white/15 bg-transparent accent-blue-400"
            >
            <div>
              <div class="text-sm text-white/70">Close on outside click</div>
              <div class="text-xs text-white/30">Close DevTools panel when clicking outside</div>
            </div>
          </label>
        </div>
      </section>
    </div>
  </div>
</template>
