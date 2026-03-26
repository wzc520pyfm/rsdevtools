<script setup lang="ts" generic="T, N">
import type { GraphBase, GraphBaseOptions } from 'nanovis'
import { useTemplateRef, watchEffect, onMounted, watch, ref } from 'vue'

const props = defineProps<{
  graph?: GraphBase<T | undefined, GraphBaseOptions<T | undefined>>
  selected?: N | undefined
  data?: any[]
  nameKey?: string
  sizeKey?: string
}>()

const emit = defineEmits<{
  (e: 'select', node: N | null): void
}>()

const el = useTemplateRef<HTMLDivElement>('el')
const legacyContainer = ref<HTMLElement>()

watchEffect(() => {
  if (props.graph && el.value)
    el.value.append(props.graph.el)
})

async function initLegacyChart() {
  if (!legacyContainer.value || !props.data?.length || !props.nameKey || !props.sizeKey) return
  legacyContainer.value.innerHTML = ''
  const { Treemap, normalizeTreeNode, createColorGetterSpectrum } = await import('nanovis')
  const root = normalizeTreeNode({
    id: 'root',
    name: 'Root',
    children: props.data.map(item => ({
      id: String(item[props.nameKey!]),
      name: String(item[props.nameKey!]),
      value: Number(item[props.sizeKey!]),
      data: item,
    })),
  })
  const graph = new Treemap(root, {
    getColor: createColorGetterSpectrum(),
    onClick: (node: any) => {
      if (node.data?.data) emit('select', node.data.data)
    },
  })
  legacyContainer.value.appendChild(graph.el)
}

onMounted(() => {
  if (!props.graph) initLegacyChart()
})

watch(() => [props.data, props.nameKey, props.sizeKey], () => {
  if (!props.graph) initLegacyChart()
}, { deep: true })
</script>

<template>
  <!-- New graph-based API -->
  <div v-if="graph" class="px4" flex="~ col gap2">
    <slot
      :selected="selected"
      :options="graph.options"
      :on-select="(node: N | null) => emit('select', node)"
    >
      <div border="b base" py2 min-h-10 />
    </slot>
    <div ref="el" />
  </div>

  <!-- Legacy data-based API -->
  <div v-else ref="legacyContainer" w-full min-h-400px border="~ base" rounded-lg />
</template>
