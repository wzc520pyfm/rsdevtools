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
  }
  catch {}
}

interface DockGroup {
  category: string
  entries: DockEntry[]
}

function getDockGroups(): DockGroup[] {
  const groups = new Map<string, DockEntry[]>()
  for (const dock of docks.value) {
    const cat = dock.category ?? 'default'
    if (!groups.has(cat))
      groups.set(cat, [])
    groups.get(cat)!.push(dock)
  }
  return Array.from(groups.entries()).map(([category, entries]) => ({ category, entries }))
}

function getCategoryLabel(category: string): string {
  const labels: Record<string, string> = {
    '~rspack': 'Rspack',
    'default': 'Default',
    'app': 'App',
    'framework': 'Framework',
    'web': 'Web',
    'advanced': 'Advanced',
    '~builtin': 'Built-in',
  }
  return labels[category] || category
}

function toggleDockVisibility(id: string) {
  if (hiddenDocks.value.has(id))
    hiddenDocks.value.delete(id)
  else
    hiddenDocks.value.add(id)
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
  <div class="h-full w-full overflow-hidden">
    <div class="h-full w-full overflow-auto p10">
      <div class="max-w-200 mx-auto">
        <h1 class="text-xl font-semibold mb-6 flex items-center gap-2 op85">
          <div class="i-ph-gear-duotone text-2xl" />
          DevTools Settings
        </h1>

        <section class="mb-8">
          <h2 class="text-lg font-medium mb-4 op75">
            Dock Entries
          </h2>
          <p class="text-sm op50 mb-4">
            Manage visibility and order of dock entries. Hidden entries will not appear in the dock bar.
          </p>

          <div class="flex flex-col gap-4">
            <template v-for="group of getDockGroups()" :key="group.category">
              <div class="border border-base rounded-lg overflow-hidden">
                <div class="flex items-center gap-2 px-4 py-3 bg-gray/5 cursor-pointer select-none border-b border-base">
                  <button
                    class="w-5 h-5 flex items-center justify-center rounded transition-colors"
                    :class="'bg-lime/20 text-lime'"
                  >
                    <div class="i-ph-check-bold text-xs" />
                  </button>
                  <span class="font-medium capitalize">{{ getCategoryLabel(group.category) }}</span>
                  <span class="text-xs op40">({{ group.entries.length }})</span>
                </div>

                <div>
                  <div
                    v-for="dock in group.entries"
                    :key="dock.id"
                    class="flex items-center gap-3 px-4 py-2.5 hover:bg-gray/5 transition-colors group border-b border-base border-t-0"
                    :class="hiddenDocks.has(dock.id) ? 'op40' : ''"
                  >
                    <button
                      class="w-6 h-6 flex items-center justify-center rounded border border-transparent hover:border-base transition-colors shrink-0"
                      :class="hiddenDocks.has(dock.id) ? 'op50' : ''"
                      :title="hiddenDocks.has(dock.id) ? 'Show' : 'Hide'"
                      @click="toggleDockVisibility(dock.id)"
                    >
                      <div
                        class="w-4 h-4 rounded flex items-center justify-center transition-colors"
                        :class="hiddenDocks.has(dock.id) ? 'bg-gray/30' : 'bg-lime/20 text-lime'"
                      >
                        <div
                          v-if="!hiddenDocks.has(dock.id)"
                          class="i-ph-check-bold text-xs"
                        />
                      </div>
                    </button>

                    <div v-if="dock.icon" :class="dock.icon" class="w-5 h-5 shrink-0" />
                    <span
                      class="flex-1 truncate"
                      :class="hiddenDocks.has(dock.id) ? 'line-through op60' : ''"
                    >
                      {{ dock.title }}
                    </span>

                    <button
                      class="w-7 h-7 flex items-center justify-center rounded hover:bg-gray/20 transition-colors shrink-0 op40 hover:op70"
                    >
                      <div class="i-ph-push-pin text-base" />
                    </button>
                  </div>
                </div>
              </div>
            </template>
          </div>

          <p v-if="docks.length === 0" class="text-sm op40 text-center py-4">
            No dock entries
          </p>
        </section>

        <section class="border-t border-base pt-6 mb-8">
          <h2 class="text-lg font-medium mb-4 op75">
            Appearance
          </h2>

          <div class="flex flex-col gap-3">
            <label class="flex items-center gap-3 cursor-pointer group">
              <button
                class="w-10 h-6 rounded-full transition-colors relative shrink-0"
                :class="showIframeAddressBar ? 'bg-lime' : 'bg-gray/30'"
                @click="showIframeAddressBar = !showIframeAddressBar"
              >
                <div
                  class="absolute top-1 w-4 h-4 rounded-full bg-white shadow transition-transform"
                  :class="showIframeAddressBar ? 'translate-x-5' : 'translate-x-1'"
                />
              </button>
              <div class="flex flex-col">
                <span class="text-sm">Show iframe address bar</span>
                <span class="text-xs op50">Display navigation controls and URL bar for iframe views</span>
              </div>
            </label>

            <label class="flex items-center gap-3 cursor-pointer group">
              <button
                class="w-10 h-6 rounded-full transition-colors relative shrink-0"
                :class="closeOnOutsideClick ? 'bg-lime' : 'bg-gray/30'"
                @click="closeOnOutsideClick = !closeOnOutsideClick"
              >
                <div
                  class="absolute top-1 w-4 h-4 rounded-full bg-white shadow transition-transform"
                  :class="closeOnOutsideClick ? 'translate-x-5' : 'translate-x-1'"
                />
              </button>
              <div class="flex flex-col">
                <span class="text-sm">Close panel on outside click</span>
                <span class="text-xs op50">Close the DevTools panel when clicking outside of it</span>
              </div>
            </label>
          </div>
        </section>

        <section class="border-t border-base pt-6">
          <h2 class="text-lg font-medium mb-4 op75">
            Reset
          </h2>
          <button
            class="px-4 py-2 rounded bg-red/10 text-red hover:bg-red/20 transition-colors flex items-center gap-2"
            @click="resetSettings"
          >
            <div class="i-ph-arrow-counter-clockwise" />
            Reset Dock Settings
          </button>
        </section>
      </div>
    </div>
  </div>
</template>
