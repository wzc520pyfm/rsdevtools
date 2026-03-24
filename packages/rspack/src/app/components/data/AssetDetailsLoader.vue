<script setup lang="ts">
import { formatBytes } from '@rspack-devtools/ui/utils/format'
import { useRpc } from '../../composables/rpc'

const props = defineProps<{
  sessionId: string
  assetName: string
}>()

const emit = defineEmits<{
  (e: 'close'): void
}>()

const { call } = useRpc()
const { data: asset, pending } = useAsyncData(
  `asset-${props.sessionId}-${props.assetName}`,
  () => call('rspack:get-asset-details', { session: props.sessionId, asset: props.assetName }),
)
</script>

<template>
  <VisualLoading v-if="pending" text="Loading asset..." />
  <div v-else-if="!asset" h-full flex items-center justify-center>
    <span op50>Asset not found</span>
  </div>
  <div v-else relative h-full w-full>
    <DisplayCloseButton
      absolute right-2 top-1.5 bg-glass z-10
      @click="emit('close')"
    />
    <div of-auto h-full p4 flex="~ col gap-4">
      <div flex="~ col gap-2">
        <h3 font-mono text-sm break-all>{{ asset.name }}</h3>
        <div flex="~ gap-4" text-xs op50>
          <span>Size: {{ formatBytes(asset.size) }}</span>
          <DisplayBadge v-if="asset.emitted" text="emitted" :color="120" />
        </div>
      </div>
      <div v-if="asset.chunks?.length">
        <h4 text-sm op50 mb1>Related Chunks</h4>
        <div flex="~ gap-2 wrap">
          <DisplayBadge v-for="chunk in asset.chunks" :key="chunk" :text="chunk" />
        </div>
      </div>
    </div>
  </div>
</template>
