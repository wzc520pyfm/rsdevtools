<script setup lang="ts">
const props = defineProps<{
  session: { id: string; timestamp: number; duration: number }
  label: string
}>()
</script>

<template>
  <div border="~ base" rounded-lg p3>
    <div text-xs op50>{{ label }}</div>
    <div font-mono text-sm mt1>{{ session.id }}</div>
    <div text-xs op50 mt1>
      <DisplayTimestamp :timestamp="session.timestamp" />
    </div>
  </div>
</template>
