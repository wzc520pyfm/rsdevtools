<script setup lang="ts">
import { formatBytes } from '@rspack-devtools/ui/utils/format'
import { useRpc } from '../../composables/rpc'

const props = defineProps<{
  sessionId: string
  chunkId: string
}>()

const emit = defineEmits<{
  (e: 'close'): void
}>()

const { call } = useRpc()
const { data: chunk, pending } = useAsyncData(
  `chunk-${props.sessionId}-${props.chunkId}`,
  () => call('rspack:get-chunk-info', { session: props.sessionId, chunk: props.chunkId }),
)
</script>

<template>
  <VisualLoading v-if="pending" text="Loading chunk..." />
  <div v-else-if="!chunk" h-full flex items-center justify-center>
    <span op50>Chunk not found</span>
  </div>
  <div v-else relative h-full w-full>
    <DisplayCloseButton
      absolute right-2 top-1.5 bg-glass z-10
      @click="emit('close')"
    />
    <div of-auto h-full p4 flex="~ col gap-4">
      <div flex="~ col gap-2">
        <h3 font-mono text-sm>Chunk #{{ chunk.id }}</h3>
        <div flex="~ gap-2" text-xs>
          <DisplayBadge v-if="chunk.entry" text="entry" :color="120" />
          <DisplayBadge v-if="chunk.initial" text="initial" :color="200" />
        </div>
        <div flex="~ gap-4" text-xs op50>
          <span>Size: {{ formatBytes(chunk.size) }}</span>
          <span>Modules: {{ chunk.moduleCount }}</span>
        </div>
      </div>
      <div v-if="chunk.files?.length">
        <h4 text-sm op50 mb1>Files</h4>
        <div flex="~ col gap-1">
          <span v-for="file in chunk.files" :key="file" font-mono text-xs>{{ file }}</span>
        </div>
      </div>
      <div v-if="chunk.modules?.length">
        <h4 text-sm op50 mb1>Modules ({{ chunk.modules.length }})</h4>
        <div border="~ base" rounded-lg max-h-60 of-auto>
          <div v-for="mod in chunk.modules" :key="mod" px3 py1 text-xs font-mono border="b base last:b-0">
            {{ mod }}
          </div>
        </div>
      </div>
    </div>
  </div>
</template>
