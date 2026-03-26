<script setup lang="ts">
import type { AssetData } from '../../../../shared/types'

defineProps<{
  assets: AssetData[]
}>()

const emit = defineEmits<{
  select: [asset: AssetData]
}>()
</script>

<template>
  <div p4>
    <DataVirtualList
      :items="assets"
      key-prop="name"
    >
      <template #default="{ item }">
        <div flex pb2>
          <div
            w-full font-mono border="~ rounded base" px2 py1 text-sm hover="bg-active"
            cursor-pointer
            @click="emit('select', item)"
          >
            <div flex="~ gap-1">
              <DisplayFileIcon :filename="item.name" />
              <span overflow-hidden text-ellipsis break-all line-clamp-2>
                {{ item.name }}
                <span v-if="item.chunkNames?.length" op50>
                  ({{ item.chunkNames.join(', ') }})
                </span>
              </span>
            </div>
          </div>
        </div>
      </template>
    </DataVirtualList>
  </div>
</template>
