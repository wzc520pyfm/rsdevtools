<script setup lang="ts">
import type { ChunkData } from '../../../../shared/types'
import { formatBytes } from '@rspack-devtools/ui/utils/format'

const props = defineProps<{
  chunks: ChunkData[]
  detailed?: boolean
}>()

const emit = defineEmits<{
  select: [chunk: ChunkData]
}>()
</script>

<template>
  <div flex="~ col gap-2">
    <div
      v-for="chunk in chunks"
      :key="chunk.id"
      flex="~ items-center gap-3"
      border="~ base rounded-lg"
      px3 py2
      cursor-pointer hover:bg-active
      font-mono text-sm
      @click="emit('select', chunk)"
    >
      <div i-ph-shapes-duotone flex-none op70 />

      <div flex="~ gap-2 items-center" min-w-0 flex-1>
        <span truncate>
          [{{ chunk.names.length ? chunk.names.join(', ') : `chunk_${chunk.id}` }}]
        </span>
        <DisplayBadge v-if="chunk.entry" text="entry" :color="120" />
        <DisplayBadge v-if="chunk.initial" text="initial" :color="200" />
        <DisplayBadge v-if="!chunk.entry && !chunk.initial" text="dynamic" :color="280" />
      </div>

      <div flex="~ items-center gap-3" flex-none op60>
        <span font-mono>#{{ chunk.id }}</span>
        <div flex="~ gap-1 items-center" :title="`${chunk.parents.length} parents`">
          <div i-ph-file-arrow-up-duotone />
          {{ chunk.parents.length }}
        </div>
        <div flex="~ gap-1 items-center" :title="`${chunk.moduleCount} modules`">
          <div i-ph-package-duotone />
          {{ chunk.moduleCount }}
        </div>
      </div>

      <template v-if="detailed">
        <div flex="~ col gap-0.5" text-xs op40>
          <span>{{ chunk.files.length }} files</span>
          <span>{{ formatBytes(chunk.size) }}</span>
        </div>
      </template>
      <template v-else>
        <DisplayFileSizeBadge :size="chunk.size" />
      </template>
    </div>
  </div>
</template>
