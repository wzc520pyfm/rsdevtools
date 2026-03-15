<script setup lang="ts">
import type { BuildSession, PackageData } from '../../../../shared/types'
import Fuse from 'fuse.js'

const route = useRoute()
const router = useRouter()
const session = inject<Ref<BuildSession | null>>('session')!

const viewType = useLocalStorage('rspack-packages-view', 'table')
const search = ref('')
const pkgFilter = ref<'all' | 'direct' | 'transitive'>('all')

const packages = computed(() => session.value?.packages ?? [])

const filteredPackages = computed(() => {
  let result = packages.value

  if (pkgFilter.value === 'direct') result = result.filter(p => p.isDirect)
  else if (pkgFilter.value === 'transitive') result = result.filter(p => !p.isDirect)

  if (search.value) {
    const fuse = new Fuse(result, { keys: ['name'], threshold: 0.3 })
    result = fuse.search(search.value).map(r => r.item)
  }

  return result.sort((a, b) => b.size - a.size)
})

const duplicatePackages = computed(() =>
  packages.value.filter(p => p.isDuplicate),
)

function openPackage(pkg: PackageData) {
  router.push({ query: { ...route.query, package: `${pkg.name}@${pkg.version}` } })
}
</script>

<template>
  <div flex="~ col gap-4">
    <DataSearchPanel v-model:search="search">
      <template #search-end>
        <div flex="~ gap-1">
          <button
            v-for="f in (['all', 'direct', 'transitive'] as const)"
            :key="f"
            btn-action text-sm
            :class="{ 'btn-action-active': pkgFilter === f }"
            @click="pkgFilter = f"
          >
            {{ f.charAt(0).toUpperCase() + f.slice(1) }}
          </button>
        </div>
      </template>
      <div flex="~ gap-1">
        <button
          v-for="vt in ['table', 'treemap', 'duplicated']"
          :key="vt"
          btn-action text-sm
          :class="{ 'btn-action-active': viewType === vt }"
          @click="viewType = vt"
        >
          {{ vt === 'duplicated' ? 'Duplicate Packages' : vt.charAt(0).toUpperCase() + vt.slice(1) }}
        </button>
      </div>
    </DataSearchPanel>

    <div v-if="viewType === 'table'">
      <PackagesTable :packages="filteredPackages" @select="openPackage" />
    </div>

    <div v-else-if="viewType === 'treemap'">
      <ChartTreemap :data="filteredPackages" name-key="name" size-key="size" @select="openPackage" />
    </div>

    <div v-else-if="viewType === 'duplicated'">
      <PackagesDuplicated :packages="duplicatePackages" @select="openPackage" />
    </div>

    <div v-if="!filteredPackages.length && viewType !== 'duplicated'" py8 text-center op50>
      No packages match the current filters
    </div>

    <div text-xs op30 text-right>
      {{ filteredPackages.length }} of {{ packages.length }} packages
    </div>
  </div>
</template>
