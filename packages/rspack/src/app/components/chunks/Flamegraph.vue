<script setup lang="ts">
const props = defineProps<{ chunks: any[] }>()
const emit = defineEmits<{ select: [chunk: any] }>()
const container = ref<HTMLElement>()

onMounted(() => initChart())

async function initChart() {
  if (!container.value || !props.chunks.length) return
  const { Flamegraph, normalizeTreeNode, createColorGetterSpectrum } = await import('nanovis')
  const root = normalizeTreeNode({
    id: 'root',
    name: 'All Chunks',
    children: props.chunks.map(c => ({
      id: c.id,
      name: c.names[0] || `Chunk #${c.id}`,
      value: c.size,
      data: c,
    })),
  })

  const graph = new Flamegraph(root, {
    getColor: createColorGetterSpectrum(),
    onClick: (node: any) => {
      if (node.data?.data) emit('select', node.data.data)
    },
  })
  container.value.appendChild(graph.el)
}
</script>

<template>
  <div ref="container" w-full min-h-300px border="~ base" rounded-lg />
</template>
