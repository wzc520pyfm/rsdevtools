<script setup lang="ts">
import { getFileIcon } from '@rspack-devtools/ui/utils/format'

defineProps<{
  name: string
}>()
</script>

<template>
  <div :class="getFileIcon(name)" />
</template>
