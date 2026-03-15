<script setup lang="ts">
defineProps<{
  visible: boolean
  x?: number
  y?: number
}>()
</script>

<template>
  <Teleport to="body">
    <div
      v-if="visible"
      fixed pointer-events-none z-200
      bg-tooltip rounded-lg shadow-lg px3 py2
      :style="{
        left: `${(x ?? 0) + 12}px`,
        top: `${(y ?? 0) + 12}px`,
      }"
    >
      <slot />
    </div>
  </Teleport>
</template>
