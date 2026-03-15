<script setup lang="ts">
import { useRpc, formatBytes } from '@/composables/rpc'
import { ref, onMounted, computed } from 'vue'

const { call } = useRpc()

const files = ref<any[]>([])
const selectedPath = ref<string | null>(null)
const fileDetail = ref<any>(null)
const loading = ref(true)
const fileLoading = ref(false)
const filter = ref('')
const info = ref<any>(null)
const draft = ref('')
const isDirty = ref(false)
const saveStatus = ref<'idle' | 'saving' | 'saved' | 'error'>('idle')

onMounted(async () => {
  try {
    const [infoResult, filesResult] = await Promise.all([
      call('rspack:get-file-info'),
      call('rspack:list-files', { targetDir: 'src' }),
    ])
    info.value = infoResult
    files.value = filesResult || []
  } catch (e) {
    console.error('Failed to load files:', e)
  } finally {
    loading.value = false
  }
})

const filtered = computed(() => {
  if (!filter.value) return files.value
  const q = filter.value.toLowerCase()
  return files.value.filter((f: any) => f.path.toLowerCase().includes(q))
})

async function selectFile(file: any) {
  selectedPath.value = file.path
  fileLoading.value = true
  isDirty.value = false
  saveStatus.value = 'idle'
  try {
    const detail = await call('rspack:read-file', { path: file.path })
    fileDetail.value = detail
    draft.value = detail?.content ?? ''
  } catch {
    fileDetail.value = null
  } finally {
    fileLoading.value = false
  }
}

function onEdit(value: string) {
  draft.value = value
  isDirty.value = value !== (fileDetail.value?.content ?? '')
}

async function saveFile() {
  if (!selectedPath.value || !isDirty.value) return
  saveStatus.value = 'saving'
  try {
    await call('rspack:write-file', { path: selectedPath.value, content: draft.value })
    if (fileDetail.value) fileDetail.value.content = draft.value
    isDirty.value = false
    saveStatus.value = 'saved'
    setTimeout(() => { if (saveStatus.value === 'saved') saveStatus.value = 'idle' }, 2000)
  } catch {
    saveStatus.value = 'error'
  }
}

function discardChanges() {
  draft.value = fileDetail.value?.content ?? ''
  isDirty.value = false
}

function getFileIcon(ext: string): string {
  const map: Record<string, string> = {
    '.js': 'i-carbon-logo-javascript text-yellow-500',
    '.jsx': 'i-carbon-logo-javascript text-yellow-500',
    '.ts': 'i-carbon-code text-blue-500',
    '.tsx': 'i-carbon-code text-blue-500',
    '.vue': 'i-carbon-application text-green-600',
    '.css': 'i-carbon-color-palette text-blue-400',
    '.scss': 'i-carbon-color-palette text-pink-500',
    '.json': 'i-carbon-json text-yellow-600',
    '.html': 'i-carbon-html text-orange-500',
    '.md': 'i-carbon-document text-gray-400',
    '.svg': 'i-carbon-image text-green-500',
    '.png': 'i-carbon-image text-green-500',
  }
  return map[ext] || 'i-carbon-document text-gray-500'
}
</script>

<template>
  <div class="h-screen flex flex-col bg-gray-50 dark:bg-gray-950 text-gray-900 dark:text-gray-100">
    <!-- Header -->
    <div class="px-4 py-3 border-b border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 flex items-center gap-3 shrink-0">
      <div class="i-carbon-folder-open text-xl text-blue-500" />
      <h1 class="text-base font-semibold">File Explorer</h1>
      <div class="flex-1" />
      <div v-if="info" class="flex items-center gap-4 text-xs text-gray-500">
        <span class="flex items-center gap-1">
          <div class="i-carbon-document-multiple text-sm" />
          {{ files.length }} files
        </span>
        <span class="font-mono bg-gray-100 dark:bg-gray-800 px-2 py-0.5 rounded">{{ info.rootDir }}</span>
      </div>
    </div>

    <div v-if="loading" class="flex-1 flex items-center justify-center">
      <div class="text-center text-gray-500">
        <div class="i-carbon-circle-dash animate-spin text-3xl mb-2" />
        <p class="text-sm">Loading file explorer...</p>
      </div>
    </div>

    <div v-else class="flex flex-1 overflow-hidden">
      <!-- Sidebar -->
      <div class="w-64 border-r border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 flex flex-col shrink-0">
        <div class="p-2 border-b border-gray-200 dark:border-gray-800">
          <input
            v-model="filter"
            class="w-full px-2.5 py-1.5 text-sm rounded-md bg-gray-100 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 outline-none focus:border-blue-400 transition-colors"
            placeholder="Filter files..."
          />
        </div>
        <div class="flex-1 overflow-auto">
          <button
            v-for="file in filtered"
            :key="file.path"
            class="w-full text-left px-3 py-1.5 text-sm flex items-center gap-2 hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors border-b border-gray-100 dark:border-gray-800/50"
            :class="selectedPath === file.path ? 'bg-blue-50 dark:bg-blue-950/30 text-blue-700 dark:text-blue-300 border-l-2 border-l-blue-500' : ''"
            @click="selectFile(file)"
          >
            <div :class="getFileIcon(file.ext)" class="text-base shrink-0" />
            <span class="truncate flex-1 font-mono text-xs">{{ file.path }}</span>
            <span class="text-xs text-gray-400 shrink-0">{{ formatBytes(file.size) }}</span>
          </button>
          <div v-if="filtered.length === 0" class="p-4 text-sm text-gray-400 text-center">No files found</div>
        </div>
      </div>

      <!-- Content -->
      <div class="flex-1 flex flex-col overflow-hidden">
        <div v-if="!selectedPath" class="flex-1 flex items-center justify-center text-gray-500">
          <div class="text-center">
            <div class="i-carbon-arrow-left text-4xl mb-3 opacity-50" />
            <p class="text-sm">Select a file to view its content</p>
          </div>
        </div>
        <template v-else>
          <div v-if="fileLoading" class="flex-1 flex items-center justify-center">
            <div class="i-carbon-circle-dash animate-spin text-2xl text-gray-400" />
          </div>
          <template v-else-if="fileDetail">
            <div class="px-4 py-2 border-b border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 flex items-center gap-3 shrink-0">
              <span class="font-mono text-sm text-gray-700 dark:text-gray-300">{{ fileDetail.path }}</span>
              <span class="text-xs text-gray-400">{{ formatBytes(fileDetail.size) }}</span>
              <div class="flex-1" />
              <Transition enter-active-class="transition-opacity" enter-from-class="opacity-0">
                <span v-if="saveStatus === 'saved'" class="text-xs text-green-500 flex items-center gap-1">
                  <div class="i-carbon-checkmark" /> Saved
                </span>
              </Transition>
              <template v-if="isDirty">
                <button class="text-xs px-2 py-1 rounded bg-gray-200 dark:bg-gray-700 hover:bg-gray-300 dark:hover:bg-gray-600 transition-colors" @click="discardChanges">Discard</button>
                <button class="text-xs px-3 py-1 rounded bg-blue-500 text-white hover:bg-blue-600 transition-colors" @click="saveFile">Save</button>
              </template>
            </div>
            <textarea
              :value="draft"
              class="flex-1 w-full p-4 font-mono text-xs bg-gray-950 text-gray-300 resize-none outline-none leading-relaxed"
              spellcheck="false"
              @input="onEdit(($event.target as HTMLTextAreaElement).value)"
            />
          </template>
          <div v-else class="flex-1 flex items-center justify-center text-red-400">
            <p class="text-sm">Failed to load file</p>
          </div>
        </template>
      </div>
    </div>
  </div>
</template>
