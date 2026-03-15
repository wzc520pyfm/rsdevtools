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
  <div flex="~ col gap-1">
    <div
      v-for="mod in modules"
      :key="mod.id"
      border="~ base" rounded-lg px3 py2
      cursor-pointer hover:bg-active
      @click="emit('select', mod)"
    >
      <div flex="~ gap-3" items-center>
        <DisplayModuleId :name="mod.name" short flex-1 min-w-0 />
        <DisplayFileSizeBadge :size="mod.size" />
      </div>
      <div flex="~ gap-4" mt1 text-xs op40>
        <span>{{ mod.moduleType }}</span>
        <span>{{ mod.chunks.length }} chunks</span>
        <span>{{ mod.dependencies?.length ?? 0 }} deps</span>
        <span>{{ mod.dependents?.length ?? 0 }} dependents</span>
      </div>
    </div>
  </div>
</template>
