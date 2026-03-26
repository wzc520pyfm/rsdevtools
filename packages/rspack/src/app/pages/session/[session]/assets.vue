<script setup lang="ts">
import type { BuildSession, AssetData } from '../../../../shared/types'
import type { AssetChartInfo, AssetChartNode } from '~/types/chart'
import { computedWithControl, useMouse } from '@vueuse/core'
import Fuse from 'fuse.js'
import { Flamegraph, Sunburst, Treemap } from 'nanovis'
import { computed, reactive, ref, watch } from 'vue'
import ChartTreemap from '~/components/chart/Treemap.vue'
import { useChartGraph } from '~/composables/chart'
import { settings } from '~/state/settings'

const route = useRoute()
const router = useRouter()
const session = inject<Ref<BuildSession | null>>('session')!

const mouse = reactive(useMouse())
const search = ref('')

const assetViewTypes = [
  {
    label: 'List',
    value: 'list',
    icon: 'i-ph-list-duotone',
  },
  {
    label: 'Folder',
    value: 'folder',
    icon: 'i-ph-folder-duotone',
  },
  {
    label: 'Treemap',
    value: 'treemap',
    icon: 'i-ph-checkerboard-duotone',
  },
  {
    label: 'Sunburst',
    value: 'sunburst',
    icon: 'i-ph-chart-donut-duotone',
  },
  {
    label: 'Flamegraph',
    value: 'flamegraph',
    icon: 'i-ph-chart-bar-horizontal-duotone',
  },
] as const

const assets = computed(() => session.value?.assets ?? [])

const fuse = computedWithControl(
  () => assets.value,
  () => new Fuse(assets.value, {
    includeScore: true,
    keys: ['name'],
    ignoreLocation: true,
    threshold: 0.4,
  }),
)

const searched = computed(() => {
  if (!search.value) return assets.value
  return fuse.value.search(search.value).map(r => r.item)
})

function toggleDisplay(type: typeof settings.value.assetViewType) {
  settings.value.assetViewType = type
}

function openAsset(asset: AssetData) {
  router.push({ query: { ...route.query, asset: asset.name } })
}

const { tree, chartOptions, graph, nodeHover, nodeSelected, selectedNode, selectNode, buildGraph } = useChartGraph<AssetData, AssetChartInfo, AssetChartNode>({
  data: searched,
  nameKey: 'name',
  sizeKey: 'size',
  rootText: 'Project',
  nodeType: 'file',
  graphOptions: {
    onClick(node: any) {
      if (node)
        nodeHover.value = node
      if (node.meta?.type === 'file') {
        selectedNode.value = node.meta
        router.replace({ query: { asset: node.meta.name } })
      }
    },
    onHover(node: any) {
      if (node && !route.query.asset)
        nodeHover.value = node
      if (node === null)
        nodeHover.value = undefined
    },
    onLeave() {
      nodeHover.value = undefined
    },
    onSelect(node: any) {
      nodeSelected.value = node || tree.value.root
      selectedNode.value = node?.meta
    },
  },
  onUpdate() {
    switch (settings.value.assetViewType) {
      case 'sunburst':
        graph.value = new Sunburst(tree.value.root, chartOptions.value)
        break
      case 'treemap':
        graph.value = new Treemap(tree.value.root, {
          ...chartOptions.value,
          selectedPaddingRatio: 0,
        })
        break
      default:
        graph.value = new Flamegraph(tree.value.root, chartOptions.value)
    }
  },
})

watch(() => settings.value.assetViewType, () => {
  buildGraph()
})
</script>

<template>
  <div relative max-h-screen of-hidden>
    <div absolute left-4 top-4 z-panel-nav>
      <DataSearchPanel v-model:search="search">
        <div flex="~ gap-2 items-center" border="t base" pt2>
          <span op50 text-sm>View as</span>
          <button
            v-for="viewType of assetViewTypes"
            :key="viewType.value"
            btn-action text-sm flex="~ gap-1 items-center"
            :class="settings.assetViewType === viewType.value ? 'btn-action-active' : 'grayscale op50'"
            @click="toggleDisplay(viewType.value)"
          >
            <div :class="viewType.icon" />
            {{ viewType.label }}
          </button>
        </div>
      </DataSearchPanel>
    </div>

    <div of-auto h-screen flex="~ col gap-2" pt32>
      <template v-if="settings.assetViewType === 'list'">
        <AssetsList v-if="searched?.length" :assets="searched" @select="openAsset" />
        <div
          absolute bottom-4 py-1 px-2 bg-glass left="1/2" translate-x="-1/2" border="~ base rounded-full" text="center xs"
        >
          <span op50>{{ searched.length }} of {{ assets.length }}</span>
        </div>
      </template>

      <template v-else-if="settings.assetViewType === 'folder'">
        <AssetsFolder v-if="searched?.length" :assets="searched" @select="openAsset" />
      </template>

      <template v-else-if="settings.assetViewType === 'treemap'">
        <ChartTreemap
          v-if="graph" :graph="graph"
          :selected="nodeSelected"
          @select="(x: any) => selectNode(x)"
        >
          <template #default="{ selected, options, onSelect }">
            <ChartNavBreadcrumb
              border="b base" py2 min-h-10
              :selected="selected"
              :options="options"
              @select="onSelect"
            />
          </template>
        </ChartTreemap>
      </template>

      <template v-else-if="settings.assetViewType === 'sunburst'">
        <AssetsSunburst
          v-if="graph" :graph="graph"
          :selected="nodeSelected"
          @select="(x: any) => selectNode(x)"
        />
      </template>

      <template v-else-if="settings.assetViewType === 'flamegraph'">
        <AssetsFlamegraph
          v-if="graph" :graph="graph"
        />
      </template>
    </div>

    <DisplayGraphHoverView :visible="!!nodeHover?.meta" :x="mouse.x" :y="mouse.y">
      <div flex="~ col gap-2">
        <div flex="~ gap-1 items-center">
          {{ (nodeHover as any)?.text }}
        </div>
        <div flex="~ gap-1 items-center">
          <DisplayFileSizeBadge :size="(nodeHover as any)?.size ?? 0" />
        </div>
      </div>
    </DisplayGraphHoverView>
  </div>
</template>
