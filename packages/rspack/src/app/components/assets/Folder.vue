<script setup lang="ts">
import type { AssetData, ModuleDest } from '../../../../shared/types'
import { computed } from 'vue'
import { toTree } from '../../utils/format'

const props = defineProps<{
  assets: AssetData[]
}>()

const emit = defineEmits<{
  select: [asset: AssetData]
}>()

const assetTree = computed(() => {
  const nodes: ModuleDest[] = []
  props.assets.forEach((i) => {
    nodes.push({
      full: i.name,
      path: i.name,
    })
  })
  return toTree(nodes, 'Project')
})

const assetsMap = computed(() => new Map<string, AssetData>(props.assets.map(a => [a.name, a])))

function onSelect(node: ModuleDest) {
  const asset = assetsMap.value.get(node.full)
  if (asset)
    emit('select', asset)
}
</script>

<template>
  <div flex="~ gap-2" p4>
    <DisplayTreeNode
      v-if="assets?.length"
      flex-1
      :node="assetTree"
      icon="i-catppuccin:folder-dist icon-catppuccin"
      icon-open="i-catppuccin:folder-dist-open icon-catppuccin"
      @select="onSelect"
    >
      <template #extra="{ node }">
        <span v-if="assetsMap.get(node.full)?.chunkNames?.length" op50>
          ({{ assetsMap.get(node.full)!.chunkNames.join(', ') }})
        </span>
      </template>
    </DisplayTreeNode>
  </div>
</template>
