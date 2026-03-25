<script setup lang="ts">
import { formatBytes } from '@rspack-devtools/ui/utils/format'

const props = defineProps<{
  assets: any[]
}>()

const emit = defineEmits<{
  select: [asset: any]
}>()
</script>

<template>
  <div border="~ base" rounded-lg of-hidden>
    <div
      v-for="asset in assets"
      :key="asset.name"
      flex="~ gap-3" items-center px3 py2
      border="b base last:b-0"
      cursor-pointer hover:bg-active
      @click="emit('select', asset)"
    >
      <DisplayFileIcon :filename="asset.name" />
      <span font-mono text-sm flex-1 truncate>{{ asset.name }}</span>
      <DisplayFileSizeBadge :size="asset.size" />
    </div>
  </div>
</template>
