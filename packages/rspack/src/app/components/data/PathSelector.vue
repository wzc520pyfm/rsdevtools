<script setup lang="ts">
defineProps<{
  startLabel?: string
  endLabel?: string
  startValue?: string
  endValue?: string
  items: Array<{ id: string; label: string }>
}>()

defineEmits<{
  'update:startValue': [value: string]
  'update:endValue': [value: string]
}>()
</script>

<template>
  <div flex="~ gap-4" items-center>
    <div flex="~ gap-2" items-center>
      <span text-xs op50>{{ startLabel || 'From' }}</span>
      <select
        :value="startValue"
        border="~ base" rounded px2 py1 text-sm bg-transparent
        @change="$emit('update:startValue', ($event.target as HTMLSelectElement).value)"
      >
        <option value="">
          All
        </option>
        <option v-for="item in items" :key="item.id" :value="item.id">
          {{ item.label }}
        </option>
      </select>
    </div>
    <div i-ph-arrow-right op30 />
    <div flex="~ gap-2" items-center>
      <span text-xs op50>{{ endLabel || 'To' }}</span>
      <select
        :value="endValue"
        border="~ base" rounded px2 py1 text-sm bg-transparent
        @change="$emit('update:endValue', ($event.target as HTMLSelectElement).value)"
      >
        <option value="">
          All
        </option>
        <option v-for="item in items" :key="item.id" :value="item.id">
          {{ item.label }}
        </option>
      </select>
    </div>
  </div>
</template>
