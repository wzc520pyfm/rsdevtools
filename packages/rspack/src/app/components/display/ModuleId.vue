<script setup lang="ts">
import { computed } from 'vue'
import { getFileIcon } from '@rspack-devtools/ui/utils/format'

const props = defineProps<{
  name: string
  short?: boolean
}>()

const displayName = computed(() => {
  if (!props.short) return props.name
  const parts = props.name.split('/')
  return parts.length > 3 ? `.../${parts.slice(-3).join('/')}` : props.name
})
</script>

<template>
  <span flex="~ gap-1" items-center font-mono text-xs min-w-0>
    <div :class="getFileIcon(name)" shrink-0 />
    <span truncate :title="name">{{ displayName }}</span>
  </span>
</template>
