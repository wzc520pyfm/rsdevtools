<script setup lang="ts">
const props = defineProps<{
  plugins: any[]
}>()

const emit = defineEmits<{
  select: [name: string]
}>()
</script>

<template>
  <div border="~ base" rounded-lg of-hidden>
    <div
      v-for="plugin in plugins"
      :key="plugin.name"
      flex="~ gap-3" items-center px3 py2
      border="b base last:b-0"
      cursor-pointer hover:bg-active
      @click="emit('select', plugin.name)"
    >
      <div i-ph-plug text-sm op50 />
      <span flex-1 text-sm font-mono>{{ plugin.name }}</span>
      <span text-xs op30 font-mono>#{{ plugin.index }}</span>
    </div>
  </div>
</template>
