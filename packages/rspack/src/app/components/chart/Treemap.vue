<script setup lang="ts">
const props = defineProps<{
  data: any[]
  nameKey: string
  sizeKey: string
}>()

const emit = defineEmits<{
  select: [item: any]
}>()

const container = ref<HTMLElement>()

onMounted(() => initChart())

watch(() => [props.data, props.nameKey, props.sizeKey], () => initChart(), { deep: true })

async function initChart() {
  if (!container.value || !props.data.length) return
  container.value.innerHTML = ''
  const { Treemap, normalizeTreeNode, createColorGetterSpectrum } = await import('nanovis')
  const root = normalizeTreeNode({
    id: 'root',
    name: 'Root',
    children: props.data.map(item => ({
      id: String(item[props.nameKey]),
      name: String(item[props.nameKey]),
      value: Number(item[props.sizeKey]),
      data: item,
    })),
  })
  const graph = new Treemap(root, {
    getColor: createColorGetterSpectrum(),
    onClick: (node: any) => {
      if (node.data?.data) emit('select', node.data.data)
    },
  })
  container.value.appendChild(graph.el)
}
</script>

<template>
  <div ref="container" w-full min-h-400px border="~ base" rounded-lg />
</template>
