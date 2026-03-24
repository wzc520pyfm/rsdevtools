<script setup lang="ts">
defineProps<{
  sessionId: string
  pluginName: string
}>()

const emit = defineEmits<{
  (e: 'close'): void
}>()
</script>

<template>
  <div relative h-full w-full>
    <DisplayCloseButton
      absolute right-2 top-1.5 bg-glass z-10
      @click="emit('close')"
    />
    <div of-auto h-full p4 flex="~ col gap-4">
      <h3 font-mono text-sm>{{ pluginName }}</h3>
      <p text-sm op50>
        Plugin details from Rspack. Per-hook timing is not available from Rspack stats.
      </p>
    </div>
  </div>
</template>
