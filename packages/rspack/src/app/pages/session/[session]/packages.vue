<script setup lang="ts">
import type { BuildSession, PackageData } from '../../../../shared/types'
import type { ClientSettings } from '~/state/settings'
import { computedWithControl, useMouse } from '@vueuse/core'
import Fuse from 'fuse.js'
import { Treemap } from 'nanovis'
import { computed, reactive, ref, watch } from 'vue'
import { useChartGraph } from '~/composables/chart'
import { settings } from '~/state/settings'

const route = useRoute()
const router = useRouter()
const session = inject<Ref<BuildSession | null>>('session')!

const mouse = reactive(useMouse())

const packageTypeRules = [
  {
    match: /.*/,
    name: 'direct',
    description: 'Direct Dependencies',
    icon: 'i-ph-package-duotone',
  },
  {
    match: /.*/,
    name: 'transitive',
    description: 'Transitive Dependencies',
    icon: 'i-ph-tree-structure-duotone',
  },
]

const searchValue = ref<{ search: string, selected: string[] | null }>({
  search: '',
  selected: null,
})

const packages = computed(() => session.value?.packages ?? [])

const fuse = computedWithControl(
  () => packages.value,
  () => new Fuse(packages.value, {
    includeScore: true,
    keys: ['name'],
    ignoreLocation: true,
    threshold: 0.4,
  }),
)

const duplicatePackagesCount = computed(() => {
  return packages.value.filter(p => p.isDuplicate).length
})

const packageViewTypes = computed(() => [
  {
    label: 'Table',
    value: 'table',
    icon: 'i-ph-table-duotone',
  },
  {
    label: 'Treemap',
    value: 'treemap',
    icon: 'i-ph-checkerboard-duotone',
  },
  {
    label: `Duplicate Packages${duplicatePackagesCount.value > 0 ? ` (${duplicatePackagesCount.value})` : ''}`,
    value: 'duplicate-packages',
    icon: 'i-ph-package-duotone',
  },
] as const)

const searched = computed(() => (
  searchValue.value.search
    ? fuse.value.search(searchValue.value.search).map(r => r.item)
    : [...packages.value]),
)

const normalizedPackages = computed(() => {
  const sizeSortType = settings.value.packageSizeSortType
  const data = searched.value.toSorted((a, b) => (a.name || '').localeCompare(b.name || ''))

  const sortedPackages = sizeSortType
    ? data.sort((a, b) => sizeSortType === 'asc' ? a.size - b.size : b.size - a.size)
    : data

  const selected = searchValue.value.selected
  if (!selected)
    return sortedPackages

  return sortedPackages.filter((item) => {
    if (selected.includes('direct') && item.isDirect)
      return true
    if (selected.includes('transitive') && !item.isDirect)
      return true
    return false
  })
})

function toggleDisplay(type: ClientSettings['packageViewType']) {
  settings.value.packageViewType = type
}

function openPackage(pkg: PackageData) {
  router.push({ query: { ...route.query, package: `${pkg.name}@${pkg.version}` } })
}

const { tree, chartOptions, graph, nodeHover, nodeSelected, selectedNode, selectNode, buildGraph } = useChartGraph<PackageData, PackageData & Record<string, any>, any>({
  data: normalizedPackages,
  nameKey: 'name',
  sizeKey: 'size',
  rootText: 'Packages',
  nodeType: 'package',
  graphOptions: {
    onHover(node: any) {
      if (node && !route.query.package)
        nodeHover.value = node
      if (node === null)
        nodeHover.value = undefined
    },
    onClick(node: any) {
      if (node.meta?.name) {
        router.replace({ query: { ...route.query, package: `${node.meta?.name}@${node.meta?.version}` } })
      }
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
    if (settings.value.packageViewType === 'treemap') {
      graph.value = new Treemap(tree.value.root, {
        ...chartOptions.value,
        selectedPaddingRatio: 0,
      })
    }
  },
})

watch(() => settings.value.packageViewType, () => {
  buildGraph()
})
</script>

<template>
  <div relative max-h-screen of-hidden>
    <div absolute left-4 top-4 z-panel-nav>
      <DataSearchPanel v-model="searchValue" :rules="packageTypeRules">
        <div flex="~ gap-2 items-center" p2 border="t base">
          <span op50 pl2 text-sm>View as</span>
          <button
            v-for="viewType of packageViewTypes"
            :key="viewType.value"
            btn-action
            :class="settings.packageViewType === viewType.value ? 'bg-active' : 'grayscale op50'"
            @click="toggleDisplay(viewType.value)"
          >
            <div :class="viewType.icon" />
            {{ viewType.label }}
          </button>
        </div>
      </DataSearchPanel>
    </div>
    <div of-auto h-screen flex="~ col gap-2" pt44 px4 pb4>
      <template v-if="settings.packageViewType === 'table'">
        <PackagesTable :packages="normalizedPackages" :session="session" @select="openPackage" />
        <div
          absolute bottom-4 py-1 px-2 bg-glass left="1/2" translate-x="-1/2" border="~ base rounded-full" text="center xs"
        >
          <span op50>{{ searched.length }} of {{ packages.length }}</span>
        </div>
      </template>
      <template v-else-if="settings.packageViewType === 'treemap'">
        <ChartTreemap
          v-if="graph && normalizedPackages.length"
          :graph="graph"
          :selected="nodeSelected"
          @select="x => selectNode(x)"
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
        <span v-else w-full h-48 flex="~ items-center justify-center" op50 italic>
          No Data
        </span>
      </template>
      <template v-else-if="settings.packageViewType === 'duplicate-packages'">
        <PackagesDuplicated :packages="normalizedPackages" :session="session" @select="openPackage" />
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
