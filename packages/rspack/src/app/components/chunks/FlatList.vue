<script setup lang="ts">
import { formatBytes } from '@rspack-devtools/ui/utils/format'

const props = defineProps<{
  chunks: any[]
  detailed?: boolean
}>()

const emit = defineEmits<{
  select: [chunk: any]
}>()
</script>

<template>
  <div border="~ base" rounded-lg of-hidden>
    <div
      v-for="chunk in chunks"
      :key="chunk.id"
      flex="~ col" px3 py2
      border="b base last:b-0"
      cursor-pointer hover:bg-active
      @click="emit('select', chunk)"
    >
      <div flex="~ gap-3" items-center>
        <span font-mono text-sm flex-1>
          {{ chunk.names.length ? chunk.names.join(', ') : `Chunk #${chunk.id}` }}
        </span>
        <div flex="~ gap-2">
          <DisplayBadge v-if="chunk.entry" text="entry" :color="120" />
          <DisplayBadge v-if="chunk.initial" text="initial" :color="200" />
        </div>
        <DisplayFileSizeBadge :size="chunk.size" />
      </div>
      <div v-if="detailed" flex="~ gap-4" mt1 text-xs op40>
        <span>{{ chunk.moduleCount }} modules</span>
        <span>{{ chunk.files.length }} files</span>
      </div>
    </div>
  </div>
</template>
