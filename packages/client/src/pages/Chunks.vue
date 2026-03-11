<script setup lang="ts">
import { formatBytes } from '@/composables/rpc'
import { computed, ref } from 'vue'

const props = defineProps<{
  session: any
  sessionId: string
}>()

const selectedChunk = ref<any>(null)

const sortedChunks = computed(() => {
  return [...(props.session?.chunks ?? [])].sort((a: any, b: any) => b.size - a.size)
})

const totalChunkSize = computed(() => {
  return sortedChunks.value.reduce((sum: number, c: any) => sum + c.size, 0)
})
</script>

<template>
  <div class="h-full flex flex-col">
    <div class="p-4 border-b border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900">
      <div class="flex items-center justify-between">
        <h1 class="text-xl font-bold flex items-center gap-2">
          <div class="i-carbon-cube text-purple-500" />
          Chunks
          <span class="badge-gray text-xs">{{ sortedChunks.length }}</span>
        </h1>
        <div class="text-sm text-gray-500">
          Total: <span class="font-mono font-medium">{{ formatBytes(totalChunkSize) }}</span>
        </div>
      </div>
    </div>

    <div class="flex-1 overflow-auto p-4">
      <div class="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <div
          v-for="chunk in sortedChunks"
          :key="chunk.id"
          class="card p-4 cursor-pointer hover:border-purple-400 dark:hover:border-purple-600 transition-all"
          :class="selectedChunk?.id === chunk.id ? 'border-purple-400 dark:border-purple-600 shadow-md' : ''"
          @click="selectedChunk = selectedChunk?.id === chunk.id ? null : chunk"
        >
          <div class="flex items-center justify-between mb-3">
            <div class="flex items-center gap-2">
              <div class="i-carbon-cube text-purple-500" />
              <span class="font-mono font-medium text-sm">{{ chunk.names.join(', ') || `Chunk ${chunk.id}` }}</span>
            </div>
            <div class="flex items-center gap-2">
              <span v-if="chunk.entry" class="badge-green text-xs">entry</span>
              <span v-if="chunk.initial" class="badge-blue text-xs">initial</span>
              <span class="font-mono text-sm font-medium">{{ formatBytes(chunk.size) }}</span>
            </div>
          </div>

          <!-- Size bar -->
          <div class="h-2 bg-gray-100 dark:bg-gray-800 rounded-full overflow-hidden mb-3">
            <div
              class="h-full rounded-full transition-all"
              :class="chunk.entry ? 'bg-green-500' : chunk.initial ? 'bg-blue-500' : 'bg-purple-500'"
              :style="{ width: `${Math.max(2, (chunk.size / (sortedChunks[0]?.size || 1)) * 100)}%` }"
            />
          </div>

          <div class="flex items-center gap-4 text-xs text-gray-500">
            <span class="flex items-center gap-1">
              <div class="i-carbon-document" />
              {{ chunk.moduleCount }} modules
            </span>
            <span class="flex items-center gap-1">
              <div class="i-carbon-folder" />
              {{ chunk.files.length }} files
            </span>
          </div>

          <!-- Expanded details -->
          <div v-if="selectedChunk?.id === chunk.id" class="mt-4 pt-4 border-t border-gray-200 dark:border-gray-800 space-y-3">
            <div v-if="chunk.files.length > 0">
              <div class="text-xs text-gray-500 mb-1 font-medium">Output Files</div>
              <div class="space-y-1">
                <div
                  v-for="file in chunk.files"
                  :key="file"
                  class="font-mono text-xs bg-gray-50 dark:bg-gray-800 px-2 py-1 rounded"
                >
                  {{ file }}
                </div>
              </div>
            </div>

            <div v-if="chunk.parents.length > 0">
              <div class="text-xs text-gray-500 mb-1 font-medium">Parents</div>
              <div class="flex gap-1 flex-wrap">
                <span v-for="p in chunk.parents" :key="p" class="badge-gray font-mono">{{ p }}</span>
              </div>
            </div>

            <div v-if="chunk.children.length > 0">
              <div class="text-xs text-gray-500 mb-1 font-medium">Children</div>
              <div class="flex gap-1 flex-wrap">
                <span v-for="c in chunk.children" :key="c" class="badge-gray font-mono">{{ c }}</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>
