<script setup lang="ts">
import { useRpc, shortenPath } from '@/composables/rpc'
import { onMounted, onUnmounted, ref, watch } from 'vue'
import * as d3 from 'd3'

const props = defineProps<{
  session: any
  sessionId: string
}>()

const { call } = useRpc()
const svgContainer = ref<HTMLDivElement>()
const loading = ref(true)
const hoveredNode = ref<any>(null)
const mousePos = ref({ x: 0, y: 0 })
const nodeCount = ref(0)
const edgeCount = ref(0)
const maxNodes = ref(200)

const groupColors: Record<string, string> = {
  'node_modules': '#ef4444',
  'styles': '#3b82f6',
  'components': '#8b5cf6',
  'typescript': '#2563eb',
  'javascript': '#eab308',
  'json': '#22c55e',
  'images': '#f97316',
  'other': '#6b7280',
}

async function renderGraph() {
  if (!svgContainer.value) return
  loading.value = true

  try {
    const { nodes, edges } = await call('rspack:get-module-graph', { session: props.sessionId })

    const filteredNodes = nodes
      .sort((a: any, b: any) => b.size - a.size)
      .slice(0, maxNodes.value)

    const nodeIds = new Set(filteredNodes.map((n: any) => n.id))
    const filteredEdges = edges.filter((e: any) => nodeIds.has(e.source) && nodeIds.has(e.target))

    nodeCount.value = filteredNodes.length
    edgeCount.value = filteredEdges.length

    svgContainer.value.innerHTML = ''

    const width = svgContainer.value.clientWidth
    const height = svgContainer.value.clientHeight

    const svg = d3.select(svgContainer.value)
      .append('svg')
      .attr('width', width)
      .attr('height', height)
      .attr('viewBox', [0, 0, width, height])

    const g = svg.append('g')

    const zoom = d3.zoom<SVGSVGElement, unknown>()
      .scaleExtent([0.1, 10])
      .on('zoom', (event) => {
        g.attr('transform', event.transform)
      })

    svg.call(zoom)

    const simulation = d3.forceSimulation(filteredNodes as any)
      .force('link', d3.forceLink(filteredEdges as any).id((d: any) => d.id).distance(60))
      .force('charge', d3.forceManyBody().strength(-100))
      .force('center', d3.forceCenter(width / 2, height / 2))
      .force('collision', d3.forceCollide().radius((d: any) => Math.sqrt(d.size / 100) + 8))

    const link = g.append('g')
      .selectAll('line')
      .data(filteredEdges)
      .join('line')
      .attr('stroke', '#4b5563')
      .attr('stroke-opacity', 0.15)
      .attr('stroke-width', 0.5)

    const node = g.append('g')
      .selectAll('circle')
      .data(filteredNodes)
      .join('circle')
      .attr('r', (d: any) => Math.max(3, Math.min(20, Math.sqrt(d.size / 200))))
      .attr('fill', (d: any) => groupColors[d.group] ?? '#6b7280')
      .attr('fill-opacity', 0.8)
      .attr('stroke', '#fff')
      .attr('stroke-width', 0.5)
      .attr('cursor', 'pointer')
      .on('mouseover', (_event: MouseEvent, d: any) => {
        hoveredNode.value = d
        d3.select(_event.currentTarget as Element).attr('fill-opacity', 1).attr('stroke-width', 2)

        link
          .attr('stroke-opacity', (l: any) => l.source.id === d.id || l.target.id === d.id ? 0.8 : 0.05)
          .attr('stroke-width', (l: any) => l.source.id === d.id || l.target.id === d.id ? 1.5 : 0.5)
          .attr('stroke', (l: any) => l.source.id === d.id || l.target.id === d.id ? '#3b82f6' : '#4b5563')
      })
      .on('mousemove', (event: MouseEvent) => {
        mousePos.value = { x: event.clientX, y: event.clientY }
      })
      .on('mouseout', (_event: MouseEvent) => {
        hoveredNode.value = null
        d3.select(_event.currentTarget as Element).attr('fill-opacity', 0.8).attr('stroke-width', 0.5)
        link
          .attr('stroke-opacity', 0.15)
          .attr('stroke-width', 0.5)
          .attr('stroke', '#4b5563')
      })
      .call(d3.drag<SVGCircleElement, any>()
        .on('start', (event) => {
          if (!event.active) simulation.alphaTarget(0.3).restart()
          event.subject.fx = event.subject.x
          event.subject.fy = event.subject.y
        })
        .on('drag', (event) => {
          event.subject.fx = event.x
          event.subject.fy = event.y
        })
        .on('end', (event) => {
          if (!event.active) simulation.alphaTarget(0)
          event.subject.fx = null
          event.subject.fy = null
        })
      )

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
  } catch (e) {
    console.error('Failed to render graph:', e)
  }

  loading.value = false
}

onMounted(renderGraph)
watch(maxNodes, renderGraph)
</script>

<template>
  <div class="h-full flex flex-col relative">
    <div class="p-4 border-b border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900">
      <div class="flex items-center justify-between">
        <h1 class="text-xl font-bold flex items-center gap-2">
          <div class="i-carbon-network-3 text-cyan-500" />
          Module Graph
        </h1>
        <div class="flex items-center gap-4 text-sm text-gray-500">
          <label class="flex items-center gap-2">
            Max Nodes:
            <select v-model.number="maxNodes" class="input-base w-24 py-1">
              <option :value="50">50</option>
              <option :value="100">100</option>
              <option :value="200">200</option>
              <option :value="500">500</option>
              <option :value="1000">1000</option>
            </select>
          </label>
          <span>{{ nodeCount }} nodes, {{ edgeCount }} edges</span>
        </div>
      </div>
    </div>

    <!-- Legend -->
    <div class="absolute top-16 left-4 z-10 card p-3 text-xs space-y-1.5 opacity-80 hover:opacity-100 transition-opacity">
      <div v-for="(color, group) in groupColors" :key="group" class="flex items-center gap-2">
        <div class="w-3 h-3 rounded-full" :style="{ backgroundColor: color }" />
        <span>{{ group }}</span>
      </div>
    </div>

    <div
      ref="svgContainer"
      class="flex-1 bg-gray-950"
      :class="loading ? 'flex items-center justify-center' : ''"
    >
      <div v-if="loading" class="flex items-center gap-2 text-gray-400">
        <div class="i-carbon-renew animate-spin" />
        Rendering graph...
      </div>
    </div>

    <!-- Hover tooltip -->
    <div
      v-if="hoveredNode"
      class="fixed z-50 pointer-events-none"
      :style="{ left: `${mousePos.x + 16}px`, top: `${mousePos.y + 16}px` }"
    >
      <div class="card p-2 text-xs space-y-1 shadow-lg max-w-xs">
        <div class="font-mono font-medium truncate">{{ shortenPath(hoveredNode.name) }}</div>
        <div class="flex items-center gap-2 text-gray-500">
          <span>{{ hoveredNode.group }}</span>
          <span>&middot;</span>
          <span>{{ hoveredNode.type }}</span>
        </div>
      </div>
    </div>
  </div>
</template>
