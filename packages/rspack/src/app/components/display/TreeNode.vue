<script setup lang="ts">
import type { ModuleDest, ModuleTreeNode } from '../../../../shared/types'

const props = withDefaults(defineProps<{
  node: ModuleTreeNode
  icon?: string
  iconOpen?: string
  padding?: number
  open?: boolean
}>(), {
  icon: 'i-catppuccin:folder icon-catppuccin',
  iconOpen: 'i-catppuccin:folder-open icon-catppuccin',
  padding: 0,
})

const emit = defineEmits<{
  (e: 'select', node: ModuleDest): void
}>()

const open = defineModel<boolean>('open', { required: false, default: true })

function select(node: ModuleDest) {
  emit('select', node)
}
</script>

<template>
  <details :open="open" @toggle="e => open = (e.target as HTMLDetailsElement)?.open">
    <summary
      cursor-default
      select-none
      text-sm
      truncate
      :style="{ paddingLeft: `${padding + 0.5}rem` }"
      flex="~ gap-1"
      px2 py1 rounded
      hover="bg-active"
    >
      <div class="i-ph-caret-right-duotone transition op50" :class="open ? 'rotate-90' : ''" />
      <div :class="open ? iconOpen || icon : icon" inline-block vertical-text-bottom />
      <div font-mono>
        <DisplayHighlightedPath :path="node.name || ''" />
      </div>
    </summary>

    <template v-if="open">
      <DisplayTreeNode
        v-for="e of Object.entries(node.children)"
        :key="e[0]" :node="e[1]"
        :padding="padding + 1"
        @select="select"
      />
      <template v-for="i of node.items" :key="i.full">
        <div
          text-sm
          ws-nowrap
          flex="~ gap-1"
          px2 py1 rounded
          hover="bg-active"
          cursor-pointer
          :style="{ paddingLeft: `${padding + 2.7}rem` }"
          @click="select(i)"
        >
          <DisplayFileIcon :filename="i.full" />
          <div font-mono>
            <DisplayHighlightedPath :path="i.path.split('/').pop() || ''" />
          </div>
        </div>
      </template>
    </template>
  </details>
</template>
