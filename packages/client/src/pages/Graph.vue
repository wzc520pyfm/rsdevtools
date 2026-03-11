<script setup lang="ts">
import { useRpc, shortenPath, formatBytes, getFileIcon } from '@/composables/rpc'
import { onMounted, onUnmounted, ref, watch, computed } from 'vue'
import * as d3 from 'd3'
import Fuse from 'fuse.js'

const props = defineProps<{ session: any; sessionId: string }>()
const { call } = useRpc()

const svgContainer = ref<HTMLDivElement>()
const loading = ref(true)
const hoveredNode = ref<any>(null)
const mousePos = ref({ x: 0, y: 0 })
const nodeCount = ref(0)
const edgeCount = ref(0)
const maxNodes = ref(200)
const viewType = ref<'graph' | 'list' | 'detail' | 'folder'>('graph')
const searchQuery = ref('')
const graphData = ref<{ nodes: any[]; edges: any[] }>({ nodes: [], edges: [] })

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

const fuse = computed(() => new Fuse(graphData.value.nodes, { keys: ['name'], threshold: 0.4, ignoreLocation: true }))

const filteredNodes = computed(() => {
  if (!searchQuery.value) return graphData.value.nodes
  return fuse.value.search(searchQuery.value).map(r => r.item)
})

const folderTree = computed(() => {
  const tree: Record<string, any[]> = {}
  for (const node of filteredNodes.value) {
    const parts = node.name.split('/')
    const folder = parts.length > 1 ? parts.slice(0, -1).join('/') : '.'
    if (!tree[folder]) tree[folder] = []
    tree[folder].push(node)
  }
  return Object.entries(tree).sort(([a], [b]) => a.localeCompare(b))
})

async function loadData() {
  loading.value = true
  try {
    graphData.value = await call('rspack:get-module-graph', { session: props.sessionId })
    nodeCount.value = graphData.value.nodes.length
    edgeCount.value = graphData.value.edges.length
  } catch (e) { console.error(e) }
  loading.value = false
}

async function renderGraph() {
  if (!svgContainer.value || viewType.value !== 'graph') return

  const { nodes, edges } = graphData.value
  const filteredNodes = nodes.sort((a: any, b: any) => b.size - a.size).slice(0, maxNodes.value)
  const nodeIds = new Set(filteredNodes.map((n: any) => n.id))
  const filteredEdges = edges.filter((e: any) => nodeIds.has(e.source) && nodeIds.has(e.target))

  svgContainer.value.innerHTML = ''
  const width = svgContainer.value.clientWidth
  const height = svgContainer.value.clientHeight

  const svg = d3.select(svgContainer.value).append('svg').attr('width', width).attr('height', height).attr('viewBox', [0, 0, width, height])
  const g = svg.append('g')
  svg.call(d3.zoom<SVGSVGElement, unknown>().scaleExtent([0.1, 10]).on('zoom', (event) => g.attr('transform', event.transform)))

  const simulation = d3.forceSimulation(filteredNodes as any)
    .force('link', d3.forceLink(filteredEdges as any).id((d: any) => d.id).distance(60))
    .force('charge', d3.forceManyBody().strength(-100))
    .force('center', d3.forceCenter(width / 2, height / 2))
    .force('collision', d3.forceCollide().radius((d: any) => Math.sqrt(d.size / 100) + 8))

  const link = g.append('g').selectAll('line').data(filteredEdges).join('line')
    .attr('stroke', '#4b5563').attr('stroke-opacity', 0.15).attr('stroke-width', 0.5)

  const node = g.append('g').selectAll('circle').data(filteredNodes).join('circle')
    .attr('r', (d: any) => Math.max(3, Math.min(20, Math.sqrt(d.size / 200))))
    .attr('fill', (d: any) => groupColors[d.group] ?? '#6b7280')
    .attr('fill-opacity', 0.8).attr('stroke', '#fff').attr('stroke-width', 0.5).attr('cursor', 'pointer')
    .on('mouseover', (_event: MouseEvent, d: any) => {
      hoveredNode.value = d
      d3.select(_event.currentTarget as Element).attr('fill-opacity', 1).attr('stroke-width', 2)
      link.attr('stroke-opacity', (l: any) => l.source.id === d.id || l.target.id === d.id ? 0.8 : 0.05)
        .attr('stroke-width', (l: any) => l.source.id === d.id || l.target.id === d.id ? 1.5 : 0.5)
        .attr('stroke', (l: any) => l.source.id === d.id || l.target.id === d.id ? '#3b82f6' : '#4b5563')
    })
    .on('mousemove', (event: MouseEvent) => { mousePos.value = { x: event.clientX, y: event.clientY } })
    .on('mouseout', (_event: MouseEvent) => {
      hoveredNode.value = null
      d3.select(_event.currentTarget as Element).attr('fill-opacity', 0.8).attr('stroke-width', 0.5)
      link.attr('stroke-opacity', 0.15).attr('stroke-width', 0.5).attr('stroke', '#4b5563')
    })
    .call(d3.drag<SVGCircleElement, any>()
      .on('start', (event) => { if (!event.active) simulation.alphaTarget(0.3).restart(); event.subject.fx = event.subject.x; event.subject.fy = event.subject.y })
      .on('drag', (event) => { event.subject.fx = event.x; event.subject.fy = event.y })
      .on('end', (event) => { if (!event.active) simulation.alphaTarget(0); event.subject.fx = null; event.subject.fy = null })
    )

  simulation.on('tick', () => {
    link.attr('x1', (d: any) => d.source.x).attr('y1', (d: any) => d.source.y).attr('x2', (d: any) => d.target.x).attr('y2', (d: any) => d.target.y)
    node.attr('cx', (d: any) => d.x).attr('cy', (d: any) => d.y)
  })
}

onMounted(async () => {
  await loadData()
  if (viewType.value === 'graph') renderGraph()
})

watch([viewType, maxNodes], () => {
  if (viewType.value === 'graph') {
    setTimeout(renderGraph, 100)
  }
})

function getNodeEdgeCount(nodeId: string): { deps: number; dependents: number } {
  const deps = graphData.value.edges.filter(e => e.source === nodeId || (e.source as any)?.id === nodeId).length
  const dependents = graphData.value.edges.filter(e => e.target === nodeId || (e.target as any)?.id === nodeId).length
  return { deps, dependents }
}
</script>

<template>
  <div class="h-full flex flex-col relative">
    <div class="p-4 border-b border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900">
      <div class="flex items-center justify-between">
        <h1 class="text-xl font-bold flex items-center gap-2">
          <div class="i-carbon-network-3 text-cyan-500" /> Module Graph
        </h1>
        <div class="flex items-center gap-4 text-sm text-gray-500">
          <div class="flex gap-1">
            <button v-for="v in (['graph', 'list', 'detail', 'folder'] as const)" :key="v"
              class="btn text-xs" :class="viewType === v ? 'bg-cyan-100 dark:bg-cyan-900 text-cyan-700 dark:text-cyan-300' : 'btn-ghost'"
              @click="viewType = v">
              <div :class="v === 'graph' ? 'i-carbon-network-3' : v === 'list' ? 'i-carbon-list' : v === 'detail' ? 'i-carbon-list-checked' : 'i-carbon-folder'" class="mr-1" />
              {{ v[0].toUpperCase() + v.slice(1) }}
            </button>
          </div>
          <label v-if="viewType === 'graph'" class="flex items-center gap-2">
            Max:
            <select v-model.number="maxNodes" class="input-base w-20 py-1">
              <option :value="50">50</option><option :value="100">100</option><option :value="200">200</option><option :value="500">500</option><option :value="1000">1000</option>
            </select>
          </label>
          <span>{{ nodeCount }} nodes, {{ edgeCount }} edges</span>
        </div>
      </div>
      <div v-if="viewType !== 'graph'" class="mt-3 relative max-w-md">
        <div class="i-carbon-search absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
        <input v-model="searchQuery" class="input-base pl-9" placeholder="Search modules..." />
      </div>
    </div>

    <!-- Graph view -->
    <template v-if="viewType === 'graph'">
      <div class="absolute top-16 left-4 z-10 card p-3 text-xs space-y-1.5 opacity-80 hover:opacity-100 transition-opacity">
        <div v-for="(color, group) in groupColors" :key="group" class="flex items-center gap-2">
          <div class="w-3 h-3 rounded-full" :style="{ backgroundColor: color }" /><span>{{ group }}</span>
        </div>
      </div>
      <div ref="svgContainer" class="flex-1 bg-gray-950" :class="loading ? 'flex items-center justify-center' : ''">
        <div v-if="loading" class="flex items-center gap-2 text-gray-400"><div class="i-carbon-renew animate-spin" /> Rendering graph...</div>
      </div>
    </template>

    <!-- List view -->
    <div v-else-if="viewType === 'list'" class="flex-1 overflow-auto">
      <table class="w-full text-sm">
        <thead class="sticky top-0 bg-gray-100 dark:bg-gray-900 z-10">
          <tr class="text-left text-xs text-gray-500 uppercase tracking-wide">
            <th class="px-4 py-2">Module</th><th class="px-4 py-2 w-24 text-center">Group</th><th class="px-4 py-2 w-24 text-right">Size</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="node in filteredNodes" :key="node.id" class="border-b border-gray-100 dark:border-gray-800/50 hover:bg-cyan-50/50 dark:hover:bg-cyan-950/20">
            <td class="px-4 py-2 font-mono text-xs truncate max-w-lg">{{ shortenPath(node.name) }}</td>
            <td class="px-4 py-2 text-center"><span class="w-3 h-3 rounded-full inline-block" :style="{ backgroundColor: groupColors[node.group] ?? '#6b7280' }" /></td>
            <td class="px-4 py-2 text-right font-mono text-xs">{{ formatBytes(node.size) }}</td>
          </tr>
        </tbody>
      </table>
    </div>

    <!-- Detail list view -->
    <div v-else-if="viewType === 'detail'" class="flex-1 overflow-auto">
      <table class="w-full text-sm">
        <thead class="sticky top-0 bg-gray-100 dark:bg-gray-900 z-10">
          <tr class="text-left text-xs text-gray-500 uppercase tracking-wide">
            <th class="px-4 py-2">Module</th><th class="px-4 py-2 w-24 text-center">Group</th><th class="px-4 py-2 w-20 text-center">Deps</th>
            <th class="px-4 py-2 w-24 text-center">Dependents</th><th class="px-4 py-2 w-24 text-right">Size</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="node in filteredNodes" :key="node.id" class="border-b border-gray-100 dark:border-gray-800/50 hover:bg-cyan-50/50 dark:hover:bg-cyan-950/20">
            <td class="px-4 py-2"><div class="flex items-center gap-2"><div :class="getFileIcon(node.name)" /><span class="font-mono text-xs truncate max-w-sm">{{ shortenPath(node.name) }}</span></div></td>
            <td class="px-4 py-2 text-center"><span class="badge text-xs" :style="{ backgroundColor: (groupColors[node.group] ?? '#6b7280') + '22', color: groupColors[node.group] ?? '#6b7280' }">{{ node.group }}</span></td>
            <td class="px-4 py-2 text-center font-mono text-xs">{{ getNodeEdgeCount(node.id).deps }}</td>
            <td class="px-4 py-2 text-center font-mono text-xs">{{ getNodeEdgeCount(node.id).dependents }}</td>
            <td class="px-4 py-2 text-right font-mono text-xs font-medium">{{ formatBytes(node.size) }}</td>
          </tr>
        </tbody>
      </table>
    </div>

    <!-- Folder view -->
    <div v-else-if="viewType === 'folder'" class="flex-1 overflow-auto p-4 space-y-4">
      <div v-for="[folder, nodes] in folderTree" :key="folder">
        <div class="flex items-center gap-2 mb-2 text-sm font-medium text-gray-600 dark:text-gray-400">
          <div class="i-carbon-folder text-cyan-400" /> {{ folder }}
          <span class="text-xs text-gray-400">({{ nodes.length }})</span>
        </div>
        <div class="ml-4 space-y-1">
          <div v-for="node in nodes" :key="node.id" class="flex items-center gap-2 py-1 text-sm hover:bg-cyan-50/50 dark:hover:bg-cyan-950/20 rounded px-2">
            <div :class="getFileIcon(node.name)" />
            <span class="font-mono text-xs flex-1">{{ node.name.split('/').pop() }}</span>
            <span class="badge text-xs" :style="{ backgroundColor: (groupColors[node.group] ?? '#6b7280') + '22', color: groupColors[node.group] ?? '#6b7280' }">{{ node.group }}</span>
            <span class="font-mono text-xs text-gray-500">{{ formatBytes(node.size) }}</span>
          </div>
        </div>
      </div>
    </div>

    <!-- Hover tooltip -->
    <div v-if="hoveredNode" class="fixed z-50 pointer-events-none" :style="{ left: `${mousePos.x + 16}px`, top: `${mousePos.y + 16}px` }">
      <div class="card p-2 text-xs space-y-1 shadow-lg max-w-xs">
        <div class="font-mono font-medium truncate">{{ shortenPath(hoveredNode.name) }}</div>
        <div class="flex items-center gap-2 text-gray-500">
          <span>{{ hoveredNode.group }}</span><span>&middot;</span><span>{{ formatBytes(hoveredNode.size) }}</span>
        </div>
      </div>
    </div>
  </div>
</template>
