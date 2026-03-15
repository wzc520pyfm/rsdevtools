<script setup lang="ts">
import { formatBytes } from '@rspack-devtools/ui/utils/format'

const props = defineProps<{
  modules: any[]
}>()

const emit = defineEmits<{
  select: [mod: any]
}>()
</script>

<template>
  <div border="~ base" rounded-lg of-hidden>
    <div
      v-for="mod in modules"
      :key="mod.id"
      flex="~ gap-3" items-center px3 py2
      border="b base last:b-0"
      cursor-pointer hover:bg-active
      @click="emit('select', mod)"
    >
      <DisplayModuleId :name="mod.name" short flex-1 min-w-0 />
      <DisplayFileSizeBadge :size="mod.size" />
    </div>
  </div>
</template>
