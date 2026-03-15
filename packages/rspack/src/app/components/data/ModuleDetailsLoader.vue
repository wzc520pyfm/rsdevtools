<script setup lang="ts">
import { formatBytes } from '@rspack-devtools/ui/utils/format'
import { useRpc } from '../../composables/rpc'

const props = defineProps<{
  sessionId: string
  moduleId: string
}>()

const { call } = useRpc()
const { data: module, pending } = useAsyncData(
  `module-${props.sessionId}-${props.moduleId}`,
  () => call('rspack:get-module-info', { session: props.sessionId, module: props.moduleId }),
)
</script>

<template>
  <VisualLoading v-if="pending" text="Loading module..." />
  <div v-else-if="!module" op50>
    Module not found
  </div>
  <div v-else flex="~ col gap-4">
    <div flex="~ col gap-2">
      <h3 font-mono text-sm break-all>{{ module.name }}</h3>
      <div flex="~ gap-4" text-xs op50>
        <span>Size: {{ formatBytes(module.size) }}</span>
        <span>Type: {{ module.moduleType }}</span>
        <span>Chunks: {{ module.chunks.length }}</span>
      </div>
    </div>

    <div v-if="module.dependencies?.length">
      <h4 text-sm op50 mb1>Dependencies ({{ module.dependencies.length }})</h4>
      <div border="~ base" rounded-lg max-h-40 of-auto>
        <div v-for="dep in module.dependencies" :key="dep" px3 py1 text-xs font-mono border="b base last:b-0">
          {{ dep }}
        </div>
      </div>
    </div>

    <div v-if="module.dependents?.length">
      <h4 text-sm op50 mb1>Dependents ({{ module.dependents.length }})</h4>
      <div border="~ base" rounded-lg max-h-40 of-auto>
        <div v-for="dep in module.dependents" :key="dep" px3 py1 text-xs font-mono border="b base last:b-0">
          {{ dep }}
        </div>
      </div>
    </div>

    <div v-if="module.source">
      <h4 text-sm op50 mb1>Source</h4>
      <DisplayCodeViewer :code="module.source" :filename="module.name" />
    </div>
  </div>
</template>
