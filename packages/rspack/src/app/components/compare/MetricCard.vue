<script setup lang="ts">
defineProps<{
  label: string
  values: number[]
  unit: string
  type: string
}>()
</script>

<template>
  <div border="~ base" rounded-lg p3>
    <div text-xs op50>{{ label }}</div>
    <div flex="~ gap-4" mt1>
      <span v-for="(value, i) in values" :key="i" font-mono text-sm>
        {{ value.toLocaleString() }}{{ unit ? ` ${unit}` : '' }}
      </span>
    </div>
  </div>
</template>
