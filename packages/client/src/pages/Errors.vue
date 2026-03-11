<script setup lang="ts">
import { ref } from 'vue'

const props = defineProps<{
  session: any
  sessionId: string
}>()

const activeTab = ref<'errors' | 'warnings'>(
  props.session?.errors?.length > 0 ? 'errors' : 'warnings'
)
</script>

<template>
  <div class="h-full flex flex-col">
    <div class="p-4 border-b border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900">
      <h1 class="text-xl font-bold flex items-center gap-2 mb-3">
        <div class="i-carbon-warning-alt text-yellow-500" />
        Errors & Warnings
      </h1>

      <div class="flex gap-1">
        <button
          class="btn text-sm"
          :class="activeTab === 'errors' ? 'bg-red-100 dark:bg-red-900/50 text-red-700 dark:text-red-300' : 'btn-ghost'"
          @click="activeTab = 'errors'"
        >
          <div class="i-carbon-error mr-1" />
          Errors
          <span class="badge-red ml-1">{{ session.errors.length }}</span>
        </button>
        <button
          class="btn text-sm"
          :class="activeTab === 'warnings' ? 'bg-yellow-100 dark:bg-yellow-900/50 text-yellow-700 dark:text-yellow-300' : 'btn-ghost'"
          @click="activeTab = 'warnings'"
        >
          <div class="i-carbon-warning mr-1" />
          Warnings
          <span class="badge-yellow ml-1">{{ session.warnings.length }}</span>
        </button>
      </div>
    </div>

    <div class="flex-1 overflow-auto p-4 space-y-3">
      <template v-if="activeTab === 'errors'">
        <div v-if="session.errors.length === 0" class="text-center py-12">
          <div class="i-carbon-checkmark-filled text-4xl text-green-500 mb-3" />
          <p class="text-gray-500">No errors - great job!</p>
        </div>

        <div
          v-for="(error, i) in session.errors"
          :key="i"
          class="card border-l-4 border-l-red-500 p-4"
        >
          <div v-if="error.moduleName" class="flex items-center gap-2 text-xs text-gray-500 mb-2">
            <div class="i-carbon-document" />
            <span class="font-mono">{{ error.moduleName }}</span>
            <span v-if="error.loc" class="font-mono text-red-400">{{ error.loc }}</span>
          </div>
          <pre class="text-sm font-mono whitespace-pre-wrap text-red-600 dark:text-red-400 bg-red-50 dark:bg-red-950/30 p-3 rounded overflow-auto max-h-60">{{ error.message }}</pre>
          <pre v-if="error.details" class="text-xs font-mono whitespace-pre-wrap text-gray-500 mt-2 p-2 bg-gray-50 dark:bg-gray-800 rounded overflow-auto max-h-40">{{ error.details }}</pre>
        </div>
      </template>

      <template v-else>
        <div v-if="session.warnings.length === 0" class="text-center py-12">
          <div class="i-carbon-checkmark-filled text-4xl text-green-500 mb-3" />
          <p class="text-gray-500">No warnings</p>
        </div>

        <div
          v-for="(warning, i) in session.warnings"
          :key="i"
          class="card border-l-4 border-l-yellow-500 p-4"
        >
          <div v-if="warning.moduleName" class="flex items-center gap-2 text-xs text-gray-500 mb-2">
            <div class="i-carbon-document" />
            <span class="font-mono">{{ warning.moduleName }}</span>
            <span v-if="warning.loc" class="font-mono text-yellow-500">{{ warning.loc }}</span>
          </div>
          <pre class="text-sm font-mono whitespace-pre-wrap text-yellow-700 dark:text-yellow-400 bg-yellow-50 dark:bg-yellow-950/30 p-3 rounded overflow-auto max-h-60">{{ warning.message }}</pre>
          <pre v-if="warning.details" class="text-xs font-mono whitespace-pre-wrap text-gray-500 mt-2 p-2 bg-gray-50 dark:bg-gray-800 rounded overflow-auto max-h-40">{{ warning.details }}</pre>
        </div>
      </template>
    </div>
  </div>
</template>
