<script setup lang="ts">
import type { BuildSession } from '../../../../shared/types'
import { useRpc } from '../../../composables/rpc'

const session = inject<Ref<BuildSession | null>>('session')!
const { call } = useRpc()
const activeTab = ref<'errors' | 'warnings'>('errors')

const errors = computed(() => session.value?.errors ?? [])
const warnings = computed(() => session.value?.warnings ?? [])

async function openInEditor(filePath: string | undefined) {
  if (!filePath) return
  await call('rspack:open-in-editor', { path: filePath })
}
</script>

<template>
  <div flex="~ col gap-4">
    <div flex="~ gap-2">
      <button
        btn-action text-sm
        :class="{ 'btn-action-active': activeTab === 'errors' }"
        @click="activeTab = 'errors'"
      >
        <div i-ph-x-circle-duotone text-red />
        Errors ({{ errors.length }})
      </button>
      <button
        btn-action text-sm
        :class="{ 'btn-action-active': activeTab === 'warnings' }"
        @click="activeTab = 'warnings'"
      >
        <div i-ph-warning-duotone text-yellow />
        Warnings ({{ warnings.length }})
      </button>
    </div>

    <div v-if="activeTab === 'errors'">
      <div v-if="!errors.length" py8 text-center op50>
        No errors
      </div>
      <div v-for="(error, i) in errors" :key="i" border="~ base" rounded-lg p4 mb2>
        <div flex="~ gap-2" items-start>
          <div i-ph-x-circle text-red mt-1 shrink-0 />
          <div flex="~ col gap-1" min-w-0>
            <pre whitespace-pre-wrap text-sm break-all>{{ error.message }}</pre>
            <div v-if="error.moduleName" flex="~ gap-2" items-center text-xs op50>
              <span font-mono>{{ error.moduleName }}</span>
              <span v-if="error.loc">{{ error.loc }}</span>
              <button
                v-if="error.moduleName"
                text-xs color-active hover:underline
                @click="openInEditor(error.moduleName)"
              >
                Open in editor
              </button>
            </div>
            <pre v-if="error.details" whitespace-pre-wrap text-xs op50 mt1>{{ error.details }}</pre>
          </div>
        </div>
      </div>
    </div>

    <div v-if="activeTab === 'warnings'">
      <div v-if="!warnings.length" py8 text-center op50>
        No warnings
      </div>
      <div v-for="(warning, i) in warnings" :key="i" border="~ base" rounded-lg p4 mb2>
        <div flex="~ gap-2" items-start>
          <div i-ph-warning text-yellow mt-1 shrink-0 />
          <div flex="~ col gap-1" min-w-0>
            <pre whitespace-pre-wrap text-sm break-all>{{ warning.message }}</pre>
            <div v-if="warning.moduleName" flex="~ gap-2" items-center text-xs op50>
              <span font-mono>{{ warning.moduleName }}</span>
              <span v-if="warning.loc">{{ warning.loc }}</span>
              <button
                v-if="warning.moduleName"
                text-xs color-active hover:underline
                @click="openInEditor(warning.moduleName)"
              >
                Open in editor
              </button>
            </div>
            <pre v-if="warning.details" whitespace-pre-wrap text-xs op50 mt1>{{ warning.details }}</pre>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>
