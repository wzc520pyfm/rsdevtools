<script setup lang="ts">
defineProps<{
  label: string
  icon?: string
  expanded?: boolean
  depth?: number
  hasChildren?: boolean
}>()

defineEmits<{
  toggle: []
  click: []
}>()
</script>

<template>
  <div
    flex="~ gap-1" items-center py0.5 px1 rounded cursor-pointer hover:bg-active
    :style="{ paddingLeft: `${(depth ?? 0) * 16 + 4}px` }"
    @click="$emit('click')"
  >
    <button
      v-if="hasChildren"
      w-4 h-4 flex items-center justify-center
      @click.stop="$emit('toggle')"
    >
      <div
        :class="expanded ? 'i-ph-caret-down' : 'i-ph-caret-right'"
        text-xs op50
      />
    </button>
    <div v-else w-4 />
    <div v-if="icon" :class="icon" text-sm shrink-0 />
    <span text-xs truncate>{{ label }}</span>
  </div>
</template>
