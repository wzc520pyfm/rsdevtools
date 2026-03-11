<script setup lang="ts">
import { shortenPath, useRpc } from '@/composables/rpc'
import { computed, ref } from 'vue'

const props = defineProps<{ session: any; sessionId: string }>()
const { call } = useRpc()

const activeTab = ref<'errors' | 'warnings'>('errors')

const errors = computed(() => props.session?.errors ?? [])
const warnings = computed(() => props.session?.warnings ?? [])
const activeList = computed(() => activeTab.value === 'errors' ? errors.value : warnings.value)

function openInEditor(item: any) {
  if (item.moduleName) {
    call('rspack:open-in-editor', { path: item.moduleName }).catch(() => {})
  }
}
</script>

<template>
  <div class="h-full flex flex-col">
    <div class="p-4 border-b border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900">
      <h1 class="text-xl font-bold flex items-center gap-2 mb-4">
        <div class="i-carbon-warning-alt text-red-500" /> Diagnostics
      </h1>
      <div class="flex gap-2">
        <button class="btn" :class="activeTab === 'errors' ? 'bg-red-100 dark:bg-red-900/50 text-red-700 dark:text-red-300' : 'btn-ghost'"
          @click="activeTab = 'errors'">
          <div class="i-carbon-error mr-1" /> Errors <span v-if="errors.length" class="badge-red ml-1">{{ errors.length }}</span>
        </button>
        <button class="btn" :class="activeTab === 'warnings' ? 'bg-yellow-100 dark:bg-yellow-900/50 text-yellow-700 dark:text-yellow-300' : 'btn-ghost'"
          @click="activeTab = 'warnings'">
          <div class="i-carbon-warning mr-1" /> Warnings <span v-if="warnings.length" class="badge-yellow ml-1">{{ warnings.length }}</span>
        </button>
      </div>
    </div>

    <div class="flex-1 overflow-auto p-4 space-y-3">
      <div v-if="activeList.length === 0" class="text-center py-20">
        <div :class="activeTab === 'errors' ? 'i-carbon-checkmark-filled text-green-500' : 'i-carbon-checkmark-filled text-green-500'" class="text-5xl mb-3 mx-auto" />
        <p class="text-lg font-medium text-gray-600 dark:text-gray-400">No {{ activeTab }}</p>
        <p class="text-sm text-gray-400">Everything looks good!</p>
      </div>

      <div v-for="(item, i) in activeList" :key="i"
        class="card overflow-hidden border-l-4"
        :class="activeTab === 'errors' ? 'border-l-red-500' : 'border-l-yellow-500'">
        <div class="p-4">
          <div class="flex items-start justify-between gap-2 mb-2">
            <div class="flex items-center gap-2">
              <div :class="activeTab === 'errors' ? 'i-carbon-error text-red-500' : 'i-carbon-warning text-yellow-500'" />
              <span class="badge-gray text-xs uppercase">#{{ i + 1 }}</span>
              <span v-if="item.moduleName" class="font-mono text-xs text-gray-500 truncate max-w-md cursor-pointer hover:text-blue-500"
                @click="openInEditor(item)">{{ shortenPath(item.moduleName) }}</span>
            </div>
            <button v-if="item.moduleName" class="btn-ghost text-xs shrink-0" @click="openInEditor(item)">
              <div class="i-carbon-launch mr-1" /> Open
            </button>
          </div>
          <pre class="text-sm font-mono whitespace-pre-wrap rounded-lg p-3 bg-gray-50 dark:bg-gray-950 text-gray-800 dark:text-gray-300">{{ item.message }}</pre>
          <div v-if="item.loc" class="text-xs text-gray-500 mt-2 font-mono">Location: {{ item.loc }}</div>
          <details v-if="item.details" class="mt-2">
            <summary class="text-xs text-gray-500 cursor-pointer">Details</summary>
            <pre class="text-xs font-mono whitespace-pre-wrap mt-1 p-2 bg-gray-50 dark:bg-gray-950 rounded text-gray-600 dark:text-gray-400">{{ item.details }}</pre>
          </details>
        </div>
      </div>
    </div>
  </div>
</template>
