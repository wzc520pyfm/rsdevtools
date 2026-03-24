<script setup lang="ts">
import { formatBytes } from '@rspack-devtools/ui/utils/format'
import { useRpc } from '../../composables/rpc'
import { ref } from 'vue'

const props = defineProps<{
  sessionId: string
  moduleId: string
}>()

const emit = defineEmits<{
  (e: 'close'): void
}>()

type ViewType = 'info' | 'dependencies' | 'source'
const viewType = ref<ViewType>('info')

const { call } = useRpc()
const { data: module, pending } = useAsyncData(
  `module-${props.sessionId}-${props.moduleId}`,
  () => call('rspack:get-module-info', { session: props.sessionId, module: props.moduleId }),
)
</script>

<template>
  <VisualLoading v-if="pending" text="Loading module..." />
  <div v-else-if="!module" h-full flex items-center justify-center>
    <span op50>Module not found</span>
  </div>
  <div v-else relative h-full w-full>
    <DisplayCloseButton
      absolute right-2 top-1.5 bg-glass z-10
      @click="emit('close')"
    />

    <!-- Header card -->
    <div
      bg-glass absolute left-2 top-2 z-10 p2
      border="~ base rounded-lg"
      flex="~ col gap-2"
    >
      <div flex="~ items-center gap-2" px2 pt1>
        <div i-ph-file-code text-sm />
        <span font-mono text-sm break-all>{{ module.name }}</span>
      </div>
      <div text-xs font-mono flex="~ items-center gap-3" ml2>
        <span flex="~ gap-1 items-center" op75>
          <span i-ph-database-duotone inline-block />
          {{ formatBytes(module.size) }}
        </span>
        <span flex="~ gap-1 items-center" op75>
          <span i-ph-tag-duotone inline-block />
          {{ module.moduleType }}
        </span>
        <span flex="~ gap-1 items-center" op75>
          <span i-ph-stack-duotone inline-block />
          {{ module.chunks.length }} chunks
        </span>
      </div>
      <div flex="~ gap-2">
        <button
          :class="viewType === 'info' ? 'text-primary' : ''"
          flex="~ gap-2 items-center justify-center"
          px2 py1 w-40
          border="~ base rounded-lg"
          hover="bg-active"
          @click="viewType = 'info'"
        >
          <div i-ph-info-duotone />
          Info
        </button>
        <button
          :class="viewType === 'dependencies' ? 'text-primary' : ''"
          flex="~ gap-2 items-center justify-center"
          px2 py1 w-40
          border="~ base rounded-lg"
          hover="bg-active"
          @click="viewType = 'dependencies'"
        >
          <div i-ph-graph-duotone />
          Dependencies
        </button>
        <button
          v-if="module.source"
          :class="viewType === 'source' ? 'text-primary' : ''"
          flex="~ gap-2 items-center justify-center"
          px2 py1 w-40
          border="~ base rounded-lg"
          hover="bg-active"
          @click="viewType = 'source'"
        >
          <div i-ph-code-duotone />
          Source
        </button>
      </div>
    </div>

    <!-- Content area -->
    <div of-auto h-full pt-30 px-4 pb-4>
      <!-- Info tab -->
      <div v-if="viewType === 'info'" flex="~ col gap-4">
        <div border="~ base" rounded-lg p4 grid="~ cols-[max-content_1fr] gap-2 items-center">
          <div i-ph-identification-card-duotone op50 />
          <div font-mono text-xs break-all>{{ module.id }}</div>
          <div i-ph-tag-duotone op50 />
          <div text-sm>{{ module.moduleType || module.type }}</div>
          <div i-ph-database-duotone op50 />
          <div text-sm>{{ formatBytes(module.size) }}</div>
          <template v-if="module.depth !== null">
            <div i-ph-tree-structure-duotone op50 />
            <div text-sm>Depth: {{ module.depth }}</div>
          </template>
          <template v-if="module.issuer">
            <div i-ph-arrow-bend-left-up-duotone op50 />
            <div font-mono text-xs break-all>Issuer: {{ module.issuer }}</div>
          </template>
        </div>
      </div>

      <!-- Dependencies tab -->
      <div v-if="viewType === 'dependencies'" flex="~ col gap-4">
        <div v-if="module.dependencies?.length">
          <h4 text-sm op50 mb2 flex="~ items-center gap-1">
            <div i-ph-arrow-right-duotone />
            Dependencies ({{ module.dependencies.length }})
          </h4>
          <div border="~ base" rounded-lg max-h-60 of-auto>
            <div v-for="dep in module.dependencies" :key="dep" px3 py2 text-xs font-mono border="b base last:b-0" break-all>
              {{ dep }}
            </div>
          </div>
        </div>

        <div v-if="module.dependents?.length">
          <h4 text-sm op50 mb2 flex="~ items-center gap-1">
            <div i-ph-arrow-left-duotone />
            Dependents ({{ module.dependents.length }})
          </h4>
          <div border="~ base" rounded-lg max-h-60 of-auto>
            <div v-for="dep in module.dependents" :key="dep" px3 py2 text-xs font-mono border="b base last:b-0" break-all>
              {{ dep }}
            </div>
          </div>
        </div>

        <div v-if="!module.dependencies?.length && !module.dependents?.length" op50 text-center py8>
          No dependencies or dependents
        </div>
      </div>

      <!-- Source tab -->
      <div v-if="viewType === 'source' && module.source">
        <DisplayCodeViewer :code="module.source" :filename="module.name" />
      </div>
    </div>
  </div>
</template>
