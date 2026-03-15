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
}

const docks = ref<DockEntry[]>([])
const hiddenDocks = ref<Set<string>>(new Set())
const pinnedDocks = ref<Set<string>>(new Set())
const customOrder = ref<Record<string, number>>({})
const showIframeAddressBar = ref(false)
const closeOnOutsideClick = ref(true)

const STORAGE_KEY = 'rspack-devtools-settings'

function loadSettings() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (raw) {
      const parsed = JSON.parse(raw)
      hiddenDocks.value = new Set(parsed.hiddenDocks ?? [])
      pinnedDocks.value = new Set(parsed.pinnedDocks ?? [])
      customOrder.value = parsed.customOrder ?? {}
      showIframeAddressBar.value = parsed.showIframeAddressBar ?? false
      closeOnOutsideClick.value = parsed.closeOnOutsideClick ?? true
    }
  }
  catch {}
}

function saveSettings() {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify({
      hiddenDocks: Array.from(hiddenDocks.value),
      pinnedDocks: Array.from(pinnedDocks.value),
      customOrder: customOrder.value,
      showIframeAddressBar: showIframeAddressBar.value,
      closeOnOutsideClick: closeOnOutsideClick.value,
    }))
  }
  catch {}
}

function toggleDock(id: string) {
  const s = new Set(hiddenDocks.value)
  if (s.has(id)) s.delete(id)
  else s.add(id)
  hiddenDocks.value = s
  saveSettings()
}

function togglePin(id: string) {
  const s = new Set(pinnedDocks.value)
  if (s.has(id)) s.delete(id)
  else s.add(id)
  pinnedDocks.value = s
  saveSettings()
}

function moveOrder(category: string, id: string, delta: number) {
  const group = groupedDocks.value.find(([c]) => c === category)
  if (!group) return
  const items = [...group[1]]
  const idx = items.findIndex(i => i.id === id)
  const newIdx = idx + delta
  if (newIdx < 0 || newIdx >= items.length) return
  items.splice(newIdx, 0, items.splice(idx, 1)[0]!)
  const newOrder = { ...customOrder.value }
  items.forEach((item, i) => { newOrder[item.id] = i })
  customOrder.value = newOrder
  saveSettings()
}

function getCategoryLabel(cat: string): string {
  const labels: Record<string, string> = {
    '~builtin': 'Built-in',
    'default': 'Default',
    'app': 'App',
    'framework': 'Framework',
    'web': 'Web',
    'advanced': 'Advanced',
  }
  return labels[cat] || cat
}

function resetSettings() {
  hiddenDocks.value = new Set()
  pinnedDocks.value = new Set()
  customOrder.value = {}
  showIframeAddressBar.value = false
  closeOnOutsideClick.value = true
  saveSettings()
}

const groupedDocks = computed(() => {
  const groups = new Map<string, DockEntry[]>()
  for (const d of docks.value) {
    const cat = d.category ?? 'default'
    if (!groups.has(cat)) groups.set(cat, [])
    groups.get(cat)!.push(d)
  }
  for (const [cat, items] of groups) {
    items.sort((a, b) => (customOrder.value[a.id] ?? 999) - (customOrder.value[b.id] ?? 999))
  }
  return Array.from(groups.entries())
})

onMounted(async () => {
  loadSettings()
  try { docks.value = await call('devtoolskit:self-inspect:get-docks') } catch {}
})
</script>

<template>
  <div class="h-screen w-full overflow-hidden bg-[#1a1a2e] text-white/85">
    <div class="h-full w-full overflow-auto p-6 lg:p-10">
      <div class="max-w-[800px] mx-auto">
        <!-- Header -->
        <h1 class="text-xl font-semibold mb-6 flex items-center gap-2 text-white/75">
          <div class="i-carbon-settings text-2xl" />
          DevTools Settings
        </h1>

        <!-- Dock Entries Section -->
        <section class="mb-8">
          <h2 class="text-base font-medium mb-3 text-white/60">
            Dock Entries
          </h2>
          <p class="text-sm text-white/35 mb-4">
            Manage visibility and order of dock entries. Hidden entries will not appear in the dock bar.
          </p>

          <div class="flex flex-col gap-4">
            <template v-for="[category, entries] in groupedDocks" :key="category">
              <div class="border border-white/8 rounded-lg overflow-hidden transition-opacity">
                <!-- Category header -->
                <div class="flex items-center gap-2 px-4 py-3 bg-white/[0.02] border-b border-white/8 select-none">
                  <span class="font-medium capitalize text-white/70">{{ getCategoryLabel(category) }}</span>
                  <span class="text-xs text-white/25">({{ entries.length }})</span>
                </div>

                <!-- Entries -->
                <div>
                  <div
                    v-for="(dock, index) in entries" :key="dock.id"
                    class="flex items-center gap-3 px-4 py-2.5 hover:bg-white/[0.03] transition-colors group"
                    :class="[
                      hiddenDocks.has(dock.id) ? 'opacity-40' : '',
                      index < entries.length - 1 ? 'border-b border-white/5' : '',
                    ]"
                  >
                    <!-- Visibility toggle -->
                    <button
                      class="w-5 h-5 flex items-center justify-center rounded transition-colors shrink-0"
                      :class="hiddenDocks.has(dock.id) ? 'bg-white/10' : 'bg-green-500/20 text-green-400'"
                      @click="toggleDock(dock.id)"
                    >
                      <div v-if="!hiddenDocks.has(dock.id)" class="i-carbon-checkmark text-xs" />
                      <div v-else class="i-carbon-view-off text-[10px] text-white/40" />
                    </button>

                    <!-- Icon & Title -->
                    <div v-if="dock.icon" class="w-5 h-5 shrink-0" :class="[dock.icon, hiddenDocks.has(dock.id) ? 'saturate-0' : '']" />
                    <span
                      class="flex-1 text-sm truncate"
                      :class="hiddenDocks.has(dock.id) ? 'line-through text-white/40' : 'text-white/80'"
                    >{{ dock.title }}</span>

                    <!-- Order controls -->
                    <div class="flex items-center gap-0.5 opacity-0 group-hover:opacity-100 transition-opacity">
                      <button
                        v-if="index > 0"
                        class="w-6 h-6 flex items-center justify-center rounded hover:bg-white/10 transition-colors"
                        @click="moveOrder(category, dock.id, -1)"
                      >
                        <div class="i-carbon-chevron-up text-xs text-white/40" />
                      </button>
                      <button
                        v-if="index < entries.length - 1"
                        class="w-6 h-6 flex items-center justify-center rounded hover:bg-white/10 transition-colors"
                        @click="moveOrder(category, dock.id, 1)"
                      >
                        <div class="i-carbon-chevron-down text-xs text-white/40" />
                      </button>
                    </div>

                    <!-- Pin toggle -->
                    <button
                      class="w-7 h-7 flex items-center justify-center rounded hover:bg-white/10 transition-colors shrink-0"
                      :class="pinnedDocks.has(dock.id) ? 'text-amber-400' : 'text-white/20 hover:text-white/50'"
                      :title="pinnedDocks.has(dock.id) ? 'Unpin' : 'Pin'"
                      @click="togglePin(dock.id)"
                    >
                      <div
                        :class="pinnedDocks.has(dock.id) ? 'i-carbon-pin-filled' : 'i-carbon-pin'"
                        class="text-sm"
                        :style="pinnedDocks.has(dock.id) ? 'transform: rotate(-45deg)' : ''"
                      />
                    </button>
                  </div>
                </div>
              </div>
            </template>

            <div v-if="docks.length === 0" class="text-sm text-white/30 text-center py-8">
              No dock entries registered.
            </div>
          </div>
        </section>

        <!-- Appearance Section -->
        <section class="border-t border-white/8 pt-6 mb-8">
          <h2 class="text-base font-medium mb-4 text-white/60">
            Appearance
          </h2>

          <div class="flex flex-col gap-4">
            <!-- Show iframe address bar -->
            <label class="flex items-center gap-3 cursor-pointer">
              <button
                class="w-10 h-6 rounded-full transition-colors relative shrink-0"
                :class="showIframeAddressBar ? 'bg-green-500' : 'bg-white/15'"
                @click="showIframeAddressBar = !showIframeAddressBar; saveSettings()"
              >
                <div
                  class="absolute top-1 w-4 h-4 rounded-full bg-white shadow transition-transform"
                  :class="showIframeAddressBar ? 'translate-x-5' : 'translate-x-1'"
                />
              </button>
              <div class="flex flex-col">
                <span class="text-sm text-white/75">Show iframe address bar</span>
                <span class="text-xs text-white/30">Display navigation controls and URL bar for iframe views</span>
              </div>
            </label>

            <!-- Close on outside click -->
            <label class="flex items-center gap-3 cursor-pointer">
              <button
                class="w-10 h-6 rounded-full transition-colors relative shrink-0"
                :class="closeOnOutsideClick ? 'bg-green-500' : 'bg-white/15'"
                @click="closeOnOutsideClick = !closeOnOutsideClick; saveSettings()"
              >
                <div
                  class="absolute top-1 w-4 h-4 rounded-full bg-white shadow transition-transform"
                  :class="closeOnOutsideClick ? 'translate-x-5' : 'translate-x-1'"
                />
              </button>
              <div class="flex flex-col">
                <span class="text-sm text-white/75">Close panel on outside click</span>
                <span class="text-xs text-white/30">Close the DevTools panel when clicking outside of it</span>
              </div>
            </label>
          </div>
        </section>

        <!-- Reset Section -->
        <section class="border-t border-white/8 pt-6">
          <h2 class="text-base font-medium mb-4 text-white/60">
            Reset
          </h2>
          <button
            class="px-4 py-2 rounded-md bg-red-500/10 text-red-400 hover:bg-red-500/20 transition-colors flex items-center gap-2 text-sm"
            @click="resetSettings"
          >
            <div class="i-carbon-reset text-base" />
            Reset Dock Settings
          </button>
        </section>
      </div>
    </div>
  </div>
</template>
