<script setup lang="ts">
defineProps<{
  path: string[]
}>()

defineEmits<{
  navigate: [index: number]
}>()
</script>

<template>
  <div flex="~ gap-1" items-center text-xs>
    <button
      v-for="(segment, i) in path"
      :key="i"
      op50 hover:op100
      @click="$emit('navigate', i)"
    >
      <span v-if="i > 0" mx1 op30>/</span>
      {{ segment }}
    </button>
  </div>
</template>
