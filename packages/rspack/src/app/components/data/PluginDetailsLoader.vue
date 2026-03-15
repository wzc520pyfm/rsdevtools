<script setup lang="ts">
defineProps<{
  sessionId: string
  pluginName: string
}>()
</script>

<template>
  <div flex="~ col gap-4">
    <h3 font-mono text-sm>{{ pluginName }}</h3>
    <p text-sm op50>
      Plugin details from Rspack. Per-hook timing is not available from Rspack stats.
    </p>
  </div>
</template>
