<script setup lang="ts">
import { formatBytes } from '@rspack-devtools/ui/utils/format'

defineProps<{
  size: number
}>()
</script>

<template>
  <span font-mono text-xs op50>{{ formatBytes(size) }}</span>
</template>
