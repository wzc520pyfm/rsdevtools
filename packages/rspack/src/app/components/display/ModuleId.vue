<script setup lang="ts">
import type { BuildSession } from '../../../../shared/types'
import { Tooltip } from 'floating-vue'
import { computed } from 'vue'

const props = withDefaults(
  defineProps<{
    name: string
    short?: boolean
    icon?: boolean
    disableTooltip?: boolean
    session?: BuildSession | null
  }>(),
  {
    icon: true,
    disableTooltip: false,
  },
)

const displayPath = computed(() => {
  if (!props.name)
    return ''
  let path = props.name
  const cwd = props.session?.cwd
  if (cwd && path.startsWith(cwd)) {
    path = `./${path.slice(cwd.length + 1)}`
  }
  if (props.short) {
    const parts = path.split('/')
    if (parts.length > 3) {
      return `.../${parts.slice(-3).join('/')}`
    }
  }
  return path
})
</script>

<template>
  <Tooltip
    my-auto text-sm font-mono block w-full
    :triggers="['hover']"
    :delay="1200"
    :disabled="disableTooltip || (name?.length || 0) < 30"
    placement="bottom-start"
  >
    <div v-if="name" flex items-center>
      <DisplayFileIcon v-if="icon" :filename="name" mr1.5 />
      <span overflow-hidden text-ellipsis break-all line-clamp-2>
        <DisplayHighlightedPath :path="displayPath" />
      </span>
      <slot />
    </div>
    <div>
      <slot name="detail" />
    </div>
    <template #popper>
      <span font-mono text-sm>
        {{ name }}
      </span>
    </template>
  </Tooltip>
</template>
