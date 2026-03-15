<script setup lang="ts">
import type { BuildSession, AssetData } from '../../../../shared/types'
import Fuse from 'fuse.js'

const route = useRoute()
const router = useRouter()
const session = inject<Ref<BuildSession | null>>('session')!

const viewType = useLocalStorage('rspack-assets-view', 'list')
const search = ref('')

const assets = computed(() => session.value?.assets ?? [])

const filteredAssets = computed(() => {
  if (!search.value) return assets.value
  const fuse = new Fuse(assets.value, { keys: ['name'], threshold: 0.3 })
  return fuse.search(search.value).map(r => r.item)
})

function openAsset(asset: AssetData) {
  router.push({ query: { ...route.query, asset: asset.name } })
}
</script>

<template>
  <div flex="~ col gap-4">
    <DataSearchPanel v-model:search="search">
      <div flex="~ gap-1">
        <button
          v-for="vt in ['list', 'folder', 'treemap', 'sunburst', 'flamegraph']"
          :key="vt"
          btn-action text-sm
          :class="{ 'btn-action-active': viewType === vt }"
          @click="viewType = vt"
        >
          {{ vt.charAt(0).toUpperCase() + vt.slice(1) }}
        </button>
      </div>
    </DataSearchPanel>

    <div v-if="viewType === 'list'">
      <AssetsList :assets="filteredAssets" @select="openAsset" />
    </div>

    <div v-else-if="viewType === 'folder'">
      <AssetsFolder :assets="filteredAssets" @select="openAsset" />
    </div>

    <div v-else-if="viewType === 'treemap'">
      <ChartTreemap :data="filteredAssets" name-key="name" size-key="size" @select="openAsset" />
    </div>

    <div v-else-if="viewType === 'sunburst'">
      <AssetsSunburst :assets="filteredAssets" @select="openAsset" />
    </div>

    <div v-else-if="viewType === 'flamegraph'">
      <AssetsFlamegraph :assets="filteredAssets" @select="openAsset" />
    </div>

    <div v-if="!filteredAssets.length" py8 text-center op50>
      No assets match the current filter
    </div>

    <div text-xs op30 text-right>
      {{ filteredAssets.length }} of {{ assets.length }} assets
    </div>
  </div>
</template>
