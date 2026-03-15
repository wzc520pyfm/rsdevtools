<script setup lang="ts">
import * as d3 from 'd3'

const props = defineProps<{
  modules: any[]
}>()

const emit = defineEmits<{
  select: [mod: any]
}>()

const container = ref<HTMLElement>()

onMounted(() => {
  if (!container.value || !props.modules.length) return
  renderGraph()
})

watch(() => [props.modules, container.value], () => {
  if (!container.value || !props.modules.length) return
  renderGraph()
}, { deep: true })

function renderGraph() {
  if (!container.value) return
  const el = container.value
  el.innerHTML = ''

  const width = el.clientWidth
  const height = 500

  const svg = d3.select(el).append('svg')
    .attr('width', width)
    .attr('height', height)
    .attr('viewBox', `0 0 ${width} ${height}`)

  const maxNodes = Math.min(props.modules.length, 200)
  const nodes = props.modules.slice(0, maxNodes).map((m: any) => ({
    id: m.id,
    name: m.name,
    size: m.size,
  }))

  const nodeIds = new Set(nodes.map((n: any) => n.id))
  const links: any[] = []
  props.modules.slice(0, maxNodes).forEach((m: any) => {
    ;(m.dependencies ?? []).forEach((dep: string) => {
      if (nodeIds.has(dep)) {
        links.push({ source: m.id, target: dep })
      }
    })
  })

  const simulation = d3.forceSimulation(nodes as any)
    .force('link', d3.forceLink(links).id((d: any) => d.id).distance(60))
    .force('charge', d3.forceManyBody().strength(-100))
    .force('center', d3.forceCenter(width / 2, height / 2))

  const link = svg.append('g')
    .selectAll('line')
    .data(links)
    .join('line')
    .attr('stroke', '#8884')
    .attr('stroke-width', 1)

  const node = svg.append('g')
    .selectAll('circle')
    .data(nodes)
    .join('circle')
    .attr('r', 5)
    .attr('fill', '#60a5fa')
    .attr('cursor', 'pointer')
    .on('click', (_: any, d: any) => {
      const mod = props.modules.find((m: any) => m.id === d.id)
      if (mod) emit('select', mod)
    })

  simulation.on('tick', () => {
    link
      .attr('x1', (d: any) => d.source.x)
      .attr('y1', (d: any) => d.source.y)
      .attr('x2', (d: any) => d.target.x)
      .attr('y2', (d: any) => d.target.y)
    node
      .attr('cx', (d: any) => d.x)
      .attr('cy', (d: any) => d.y)
  })
}
</script>

<template>
  <div ref="container" w-full min-h-500px border="~ base" rounded-lg />
</template>
