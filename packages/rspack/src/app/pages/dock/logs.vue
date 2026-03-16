<script setup lang="ts">
import { useTimeAgo } from '@vueuse/core'
import { computed, onMounted, onUnmounted, ref } from 'vue'
import FilterToggles from '../../components/logs/FilterToggles.vue'
import HashBadge from '../../components/logs/HashBadge.vue'
import LogItem from '../../components/logs/LogItem.vue'
import { fromEntries, getHashColorFromString, levels } from '../../components/logs/LogItemConstants'
import type { LogFrom, LogLevel } from '../../components/logs/LogItemConstants'
import { useRpc } from '../../composables/rpc'

interface LogEntry {
  id: string
  message: string
  level: LogLevel
  description?: string
  from: LogFrom
  timestamp: number
  category?: string
  labels?: string[]
  status?: 'loading' | 'idle'
}

function formatAbsoluteTime(ts: number): string {
  return new Date(ts).toLocaleTimeString()
}

type SortMode = 'newest' | 'oldest' | 'level'

const sortLabels: Record<SortMode, string> = {
  newest: 'Newest first',
  oldest: 'Oldest first',
  level: 'By severity',
}
const sortIcons: Record<SortMode, string> = {
  newest: 'i-ph:sort-descending-duotone',
  oldest: 'i-ph:sort-ascending-duotone',
  level: 'i-ph:warning-diamond-duotone',
}

const { call } = useRpc()
const logs = ref<LogEntry[]>([])
const selectedId = ref<string | null>(null)
const search = ref('')
const activeFilters = ref<Set<LogLevel>>(new Set())
const activeLabelFilters = ref<Set<string>>(new Set())
const activeFromFilters = ref<Set<LogFrom>>(new Set())
const activeCategories = ref<Set<string>>(new Set())
const sortBy = ref<SortMode>('newest')

let syncVersion = 0
let pollTimer: ReturnType<typeof setInterval> | null = null

const allLevels: LogLevel[] = Object.keys(levels) as LogLevel[]
const allFroms: LogFrom[] = Object.keys(fromEntries) as LogFrom[]
const sortModes: SortMode[] = ['newest', 'oldest', 'level']

const levelPriority: Record<LogLevel, number> = {
  error: 0,
  warn: 1,
  info: 2,
  success: 3,
  debug: 4,
}

function cycleSortMode() {
  const idx = sortModes.indexOf(sortBy.value)
  sortBy.value = sortModes[(idx + 1) % sortModes.length] as SortMode
}

function toggleFilter(level: string) {
  const filters = activeFilters.value
  if (filters.has(level as LogLevel))
    filters.delete(level as LogLevel)
  else
    filters.add(level as LogLevel)
}

function toggleLabelFilter(label: string) {
  const filters = activeLabelFilters.value
  if (filters.has(label))
    filters.delete(label)
  else
    filters.add(label)
}

function toggleFrom(from: string) {
  const s = activeFromFilters.value
  if (s.has(from as LogFrom))
    s.delete(from as LogFrom)
  else
    s.add(from as LogFrom)
}

function toggleCategory(category: string) {
  const c = activeCategories.value
  if (c.has(category))
    c.delete(category)
  else
    c.add(category)
}

const hasActiveFilter = computed(() => {
  return activeFilters.value.size > 0
    || activeLabelFilters.value.size > 0
    || activeFromFilters.value.size > 0
    || activeCategories.value.size > 0
    || search.value.length > 0
})

function resetFilters() {
  activeFilters.value.clear()
  activeLabelFilters.value.clear()
  activeFromFilters.value.clear()
  activeCategories.value.clear()
  search.value = ''
}

const allLabels = computed(() => {
  const labelSet = new Set<string>()
  for (const entry of logs.value) {
    if (entry.labels) {
      for (const label of entry.labels)
        labelSet.add(label)
    }
  }
  return Array.from(labelSet).sort()
})

const allCategories = computed(() => {
  const cats = new Set<string>()
  for (const entry of logs.value) {
    if (entry.category)
      cats.add(entry.category)
  }
  return Array.from(cats).sort()
})

const filteredEntries = computed(() => {
  let entries = logs.value
  if (activeFilters.value.size > 0)
    entries = entries.filter(e => activeFilters.value.has(e.level))
  if (activeLabelFilters.value.size > 0)
    entries = entries.filter(e => e.labels?.some(l => activeLabelFilters.value.has(l)))
  if (activeFromFilters.value.size > 0)
    entries = entries.filter(e => activeFromFilters.value.has(e.from))
  if (activeCategories.value.size > 0)
    entries = entries.filter(e => e.category && activeCategories.value.has(e.category))
  if (search.value) {
    const q = search.value.toLowerCase()
    entries = entries.filter(e =>
      e.message.toLowerCase().includes(q)
      || e.description?.toLowerCase().includes(q)
      || e.from?.toLowerCase().includes(q)
      || e.category?.toLowerCase().includes(q)
      || e.labels?.some(l => l.toLowerCase().includes(q)),
    )
  }

  if (sortBy.value === 'oldest')
    return [...entries]
  if (sortBy.value === 'level')
    return entries.toSorted((a, b) => levelPriority[a.level] - levelPriority[b.level])
  return entries.toReversed()
})

const selectedEntry = computed(() => {
  if (!selectedId.value)
    return null
  return logs.value.find(e => e.id === selectedId.value) ?? null
})

const selectedTimeAgo = useTimeAgo(computed(() => selectedEntry.value?.timestamp ?? Date.now()))

async function fetchLogs(since?: number) {
  try {
    const result = await call('devtoolskit:internal:logs:list', since)
    if (since === undefined) {
      logs.value = result.entries
    }
    else {
      for (const id of result.removedIds) {
        const idx = logs.value.findIndex(e => e.id === id)
        if (idx >= 0) logs.value.splice(idx, 1)
      }
      for (const entry of result.entries) {
        const idx = logs.value.findIndex(e => e.id === entry.id)
        if (idx >= 0) logs.value[idx] = entry
        else logs.value.push(entry)
      }
    }
    syncVersion = result.version
  }
  catch {}
}

async function clearAll() {
  await call('devtoolskit:internal:logs:clear')
  logs.value = []
  selectedId.value = null
}

async function removeEntry(id: string) {
  await call('devtoolskit:internal:logs:remove', id)
  logs.value = logs.value.filter(e => e.id !== id)
  if (selectedId.value === id) selectedId.value = null
}

async function dismissFiltered() {
  const ids = filteredEntries.value.map(e => e.id)
  for (const id of ids)
    await call('devtoolskit:internal:logs:remove', id)
  selectedId.value = null
}

onMounted(() => {
  fetchLogs()
  pollTimer = setInterval(() => fetchLogs(syncVersion), 2000)
})
onUnmounted(() => { if (pollTimer) clearInterval(pollTimer) })
</script>

<template>
  <div class="w-full h-full grid grid-rows-[max-content_1fr]">
    <!-- Toolbar -->
    <div class="border-base border-b p3 flex flex-col gap-2">
      <!-- Row 1: Search + sort + actions -->
      <div class="flex items-center gap-1">
        <input
          v-model="search"
          type="text"
          placeholder="Search logs..."
          class="bg-transparent border border-base rounded px-2 py-0.5 text-xs w-48 outline-none focus:border-purple"
        >
        <button
          class="flex items-center gap-0.5 op50 hover:op100 p-1 rounded hover:bg-active transition"
          :title="sortLabels[sortBy]"
          @click="cycleSortMode"
        >
          <div :class="sortIcons[sortBy]" class="w-4 h-4" />
        </button>
        <div class="flex-1" />
        <span v-if="filteredEntries.length !== logs.length" class="text-xs op40">
          {{ filteredEntries.length }}/{{ logs.length }}
        </span>
        <button
          v-if="hasActiveFilter"
          class="text-xs op50 hover:op100 px-1.5 py-0.5 hover:bg-active rounded transition flex items-center gap-0.5"
          title="Reset all filters"
          @click="resetFilters"
        >
          <div class="i-ph:funnel-x-duotone w-3.5 h-3.5" />
          Reset Filters
        </button>
        <div v-if="hasActiveFilter" class="border-l border-base h-4 mx-0.5" />
        <button
          v-if="hasActiveFilter && filteredEntries.length > 0"
          class="text-xs op50 hover:op100 px-1.5 py-0.5 hover:bg-active rounded transition flex items-center gap-0.5"
          title="Dismiss all matching the current filter"
          @click="dismissFiltered"
        >
          <div class="i-ph:trash-duotone w-3.5 h-3.5" />
          Dismiss filtered
        </button>
        <button
          v-if="!hasActiveFilter && logs.length > 0"
          class="text-xs op50 hover:op100 px-1.5 py-0.5 hover:bg-active rounded transition flex items-center gap-0.5"
          title="Dismiss all logs"
          @click="clearAll"
        >
          <div class="i-ph:trash-duotone w-3.5 h-3.5" />
          Dismiss all
        </button>
      </div>

      <!-- Row 2: Level + source + category + label filters -->
      <div class="flex flex-wrap items-center gap-1">
        <FilterToggles
          label="Level"
          :items="allLevels"
          :active="(activeFilters as Set<string>)"
          :styles="levels"
          @toggle="toggleFilter"
        />

        <div class="border-l border-base h-4 mx-0.5" />

        <FilterToggles
          label="From"
          :items="allFroms"
          :active="(activeFromFilters as Set<string>)"
          :styles="fromEntries"
          @toggle="toggleFrom"
        />

        <template v-if="allCategories.length > 0">
          <div class="border-l border-base h-4 mx-1" />
          <FilterToggles
            label="Category"
            :items="allCategories"
            :active="(activeCategories as Set<string>)"
            :hash-color="getHashColorFromString"
            @toggle="toggleCategory"
          />
        </template>

        <template v-if="allLabels.length > 0">
          <div class="border-l border-base h-4 mx-1" />
          <FilterToggles
            label="Labels"
            :items="allLabels"
            :active="(activeLabelFilters as Set<string>)"
            :hash-color="getHashColorFromString"
            @toggle="toggleLabelFilter"
          />
        </template>
      </div>
    </div>

    <!-- Content -->
    <div class="h-full of-hidden" :class="selectedEntry ? 'grid grid-cols-[1fr_1fr]' : ''">
      <!-- Log list -->
      <div class="h-full of-y-auto">
        <div v-if="filteredEntries.length === 0" class="flex items-center justify-center h-full op50 text-sm">
          No logs
        </div>
        <div
          v-for="entry of filteredEntries"
          :key="entry.id"
          class="w-full text-left border-b border-base hover:bg-active transition border-l-2 text-sm group cursor-pointer"
          :class="[
            selectedId === entry.id ? 'bg-active' : '',
          ]"
          @click="selectedId = selectedId === entry.id ? null : entry.id"
        >
          <LogItem :entry class="px-3 py-2.5">
            <template #actions>
              <button
                class="op0 group-hover:op50 hover:op100! p-0.5 rounded hover:bg-active flex-none"
                title="Dismiss"
                @click.stop="removeEntry(entry.id)"
              >
                <div class="i-ph-trash-duotone w-3 h-3" />
              </button>
            </template>
          </LogItem>
        </div>
      </div>

      <!-- Detail panel -->
      <div v-if="selectedEntry" class="h-full of-y-auto border-l border-base p-4">
        <!-- Header -->
        <div class="flex items-start gap-2 mb-3">
          <div class="flex-1">
            <div class="font-medium text-lg">
              {{ selectedEntry.message }}
            </div>
          </div>
          <button class="op50 hover:op100 p-1" title="Dismiss" @click="removeEntry(selectedEntry!.id)">
            <div class="i-ph-trash-duotone w-4 h-4" />
          </button>
          <button class="op50 hover:op100 p-1" title="Close detail" @click="selectedId = null">
            <div class="i-ph-x w-4 h-4" />
          </button>
        </div>

        <!-- Metadata row -->
        <div class="flex flex-wrap items-center gap-2 mb-3 text-xs">
          <span class="flex items-center gap-1" :class="levels[selectedEntry.level].color">
            <div :class="levels[selectedEntry.level].icon" class="w-3.5 h-3.5" />
            <span class="capitalize">{{ selectedEntry.level }}</span>
          </span>
          <span v-if="fromEntries[selectedEntry.from]" class="flex items-center gap-1" :class="fromEntries[selectedEntry.from].color">
            <div :class="fromEntries[selectedEntry.from].icon" class="w-3.5 h-3.5" />
            {{ fromEntries[selectedEntry.from].label }}
          </span>
          <span v-if="selectedEntry.status === 'loading'" class="flex items-center gap-1 text-amber">
            <div class="w-3 h-3 border-1.5 border-current border-t-transparent rounded-full animate-spin" />
            Loading
          </span>
          <span class="op40" :title="formatAbsoluteTime(selectedEntry.timestamp)">
            {{ selectedTimeAgo }}
          </span>
        </div>

        <!-- Description -->
        <div v-if="selectedEntry.description" class="text-sm op80 mb-3 whitespace-pre-wrap">
          {{ selectedEntry.description }}
        </div>

        <!-- Category + Labels -->
        <div v-if="selectedEntry.category || (selectedEntry.labels && selectedEntry.labels.length)" class="flex flex-wrap gap-1 mb-3">
          <HashBadge v-if="selectedEntry.category" :label="selectedEntry.category" />
          <HashBadge v-for="label of selectedEntry.labels" :key="label" :label="label" />
        </div>

        <!-- ID + Timestamp -->
        <div class="flex flex-col gap-1 mb-3 text-xs op40 font-mono border-t border-base pt-3">
          <span>ID: {{ selectedEntry.id }}</span>
          <span>{{ formatAbsoluteTime(selectedEntry.timestamp) }} ({{ new Date(selectedEntry.timestamp).toLocaleDateString() }})</span>
        </div>
      </div>
    </div>
  </div>
</template>
