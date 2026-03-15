<script setup lang="ts">
const props = defineProps<{ chunks: any[] }>()
const emit = defineEmits<{ select: [chunk: any] }>()
</script>

<template>
  <div border="~ base" rounded-lg p4 text-center op50>
    <p>Chunk dependency graph</p>
    <p text-xs mt2>{{ chunks.length }} chunks loaded</p>
  </div>
</template>
