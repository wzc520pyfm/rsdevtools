<script setup lang="ts">
import { useRpc } from '@/composables/rpc'
import { computed, onMounted, ref } from 'vue'

const { call } = useRpc()

interface DockEntry {
  id: string
  title: string
  type: string
  icon?: string
  category?: string
  isHidden?: boolean
}

const docks = ref<DockEntry[]>([])
const hiddenDocks = ref<Set<string>>(new Set())

const STORAGE_KEY = 'rspack-devtools-settings'

function loadSettings() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (raw) {
      const parsed = JSON.parse(raw)
      hiddenDocks.value = new Set(parsed.hiddenDocks ?? [])
    }
  }
  catch {}
}

function saveSettings() {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify({
      hiddenDocks: Array.from(hiddenDocks.value),
    }))
  }
  catch {}
}

function toggleDock(id: string) {
  if (hiddenDocks.value.has(id)) {
    hiddenDocks.value.delete(id)
  }
  else {
    hiddenDocks.value.add(id)
  }
  hiddenDocks.value = new Set(hiddenDocks.value)
  saveSettings()
}

function resetSettings() {
  hiddenDocks.value = new Set()
  saveSettings()
}

const groupedDocks = computed(() => {
  const groups = new Map<string, DockEntry[]>()
  for (const d of docks.value) {
    const cat = d.category ?? 'default'
    if (!groups.has(cat)) groups.set(cat, [])
    groups.get(cat)!.push(d)
  }
  return Array.from(groups.entries())
})

onMounted(async () => {
  loadSettings()
  try {
    docks.value = await call('devtoolskit:self-inspect:get-docks')
  }
  catch {}
})
</script>

<template>
  <div class="h-screen flex flex-col bg-gray-50 dark:bg-gray-950 text-gray-900 dark:text-gray-100">
    <!-- Header -->
    <div class="px-4 py-3 border-b border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 shrink-0">
      <div class="flex items-center gap-2">
        <div class="i-carbon-settings text-lg text-gray-400" />
        <h1 class="text-base font-semibold mr-auto">
          Settings
        </h1>
        <button
          class="px-2 py-1 text-xs rounded-md border border-gray-200 dark:border-gray-700 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
          @click="resetSettings"
        >
          Reset
        </button>
      </div>
    </div>

    <div class="flex-1 overflow-y-auto p-4 space-y-6">
      <!-- Dock entries -->
      <section>
        <h2 class="text-sm font-semibold mb-3">
          Dock Entries Visibility
        </h2>
        <p class="text-xs text-gray-400 mb-3">
          Toggle which dock entries are visible in the dock bar.
        </p>

        <div v-for="[category, entries] in groupedDocks" :key="category" class="mb-4">
          <div class="text-xs text-gray-400 uppercase tracking-wider mb-2">
            {{ category }}
          </div>
          <div class="space-y-1">
            <label
              v-for="entry in entries" :key="entry.id"
              class="flex items-center gap-3 px-3 py-2 rounded-md hover:bg-gray-100 dark:hover:bg-gray-800 cursor-pointer transition-colors"
            >
              <input
                type="checkbox"
                :checked="!hiddenDocks.has(entry.id)"
                class="rounded"
                @change="toggleDock(entry.id)"
              >
              <span class="text-sm">{{ entry.title }}</span>
              <span class="ml-auto text-xs text-gray-400">{{ entry.type }}</span>
            </label>
          </div>
        </div>

        <div v-if="docks.length === 0" class="text-sm text-gray-400">
          No dock entries registered.
        </div>
      </section>
    </div>
  </div>
</template>
