<script setup lang="ts">
const props = defineProps<{ assets: any[] }>()
const emit = defineEmits<{ select: [asset: any] }>()
const container = ref<HTMLElement>()

onMounted(() => initChart())

async function initChart() {
  if (!container.value || !props.assets.length) return
  const { Flamegraph, normalizeTreeNode, createColorGetterSpectrum } = await import('nanovis')
  const root = normalizeTreeNode({
    id: 'root',
    name: 'All Assets',
    children: props.assets.map(a => ({
      id: a.name,
      name: a.name,
      value: a.size,
      data: a,
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
