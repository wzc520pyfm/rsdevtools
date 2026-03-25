<script setup lang="ts">
import type { BuildSession, ModuleData } from '../../../../shared/types'

defineProps<{
  session?: BuildSession | null
  modules: ModuleData[]
}>()

const emit = defineEmits<{
  (e: 'select', module: ModuleData): void
}>()
</script>

<template>
  <div flex="~ col gap-2" p4>
    <DataVirtualList
      :items="modules"
      key-prop="id"
    >
      <template #default="{ item }">
        <div flex pb2 @click="emit('select', item)">
          <DisplayModuleId
            :name="item.name"
            :session="session"
            hover="bg-active" block px2 p1 w-full
            border="~ base rounded"
          >
            <template #detail>
              <div flex="~ gap-4 wrap" text-xs op40 mt0.5>
                <span>{{ item.moduleType }}</span>
                <span>{{ item.chunks.length }} chunks</span>
                <span>{{ item.dependencies?.length ?? 0 }} deps</span>
                <span>{{ item.dependents?.length ?? 0 }} dependents</span>
                <DisplayFileSizeBadge :size="item.size" />
              </div>
            </template>
          </DisplayModuleId>
        </div>
      </template>
    </DataVirtualList>
  </div>
</template>
