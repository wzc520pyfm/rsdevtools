<script setup lang="ts">
import type { BuildSession, ModuleData } from '../../../../shared/types'

withDefaults(defineProps<{
  session?: BuildSession | null
  modules: ModuleData[]
  disableTooltip?: boolean
}>(), {
  disableTooltip: false,
})

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
            :disable-tooltip="disableTooltip"
          />
        </div>
      </template>
    </DataVirtualList>
  </div>
</template>
