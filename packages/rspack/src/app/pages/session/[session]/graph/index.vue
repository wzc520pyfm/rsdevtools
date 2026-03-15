<script setup lang="ts">
import type { BuildSession, ModuleData } from '../../../../../shared/types'
import Fuse from 'fuse.js'

const route = useRoute()
const router = useRouter()
const session = inject<Ref<BuildSession | null>>('session')!

const viewType = useLocalStorage('rspack-modules-view', 'list')
const search = ref('')
const showNodeModules = ref(true)

const fileTypeFilters = ref([
  { id: 'js', label: 'JavaScript', icon: 'i-carbon-logo-javascript', checked: true },
  { id: 'ts', label: 'TypeScript', icon: 'i-carbon-code', checked: true },
  { id: 'css', label: 'CSS', icon: 'i-carbon-color-palette', checked: true },
  { id: 'vue', label: 'Vue', icon: 'i-carbon-application', checked: true },
  { id: 'html', label: 'HTML', icon: 'i-carbon-html', checked: true },
  { id: 'json', label: 'JSON', icon: 'i-carbon-json', checked: true },
  { id: 'other', label: 'Other', icon: 'i-carbon-document', checked: true },
])

const modules = computed(() => session.value?.modules ?? [])

function getFileType(name: string): string {
  if (/\.jsx?$/.test(name)) return 'js'
  if (/\.tsx?$/.test(name)) return 'ts'
  if (/\.css$|\.s[ac]ss$|\.less$/.test(name)) return 'css'
  if (/\.vue$/.test(name)) return 'vue'
  if (/\.html?$/.test(name)) return 'html'
  if (/\.json$/.test(name)) return 'json'
  return 'other'
}

const filteredModules = computed(() => {
  let result = modules.value

  if (!showNodeModules.value) {
    result = result.filter(m => !m.name.includes('node_modules'))
  }

  const activeTypes = fileTypeFilters.value.filter(f => f.checked).map(f => f.id)
  if (activeTypes.length < fileTypeFilters.value.length) {
    result = result.filter(m => activeTypes.includes(getFileType(m.name)))
  }

  if (search.value) {
    const fuse = new Fuse(result, { keys: ['name'], threshold: 0.3 })
    result = fuse.search(search.value).map(r => r.item)
  }

  return result
})

function openModule(mod: ModuleData) {
  router.push({ query: { ...route.query, module: mod.id } })
}
</script>

<template>
  <div flex="~ col gap-4">
    <DataSearchPanel v-model:search="search">
      <template #search-end>
        <button
          btn-action text-sm
          :class="{ 'btn-action-active': showNodeModules }"
          @click="showNodeModules = !showNodeModules"
        >
          Node Modules
        </button>
        <div flex="~ gap-1">
          <button
            v-for="ft in fileTypeFilters"
            :key="ft.id"
            btn-action text-xs px1
            :class="{ 'btn-action-active': ft.checked }"
            :title="ft.label"
            @click="ft.checked = !ft.checked"
          >
            <div :class="ft.icon" />
          </button>
        </div>
      </template>
      <div flex="~ gap-1">
        <button
          v-for="vt in ['list', 'detailed', 'graph', 'folder']"
          :key="vt"
          btn-action text-sm
          :class="{ 'btn-action-active': viewType === vt }"
          @click="viewType = vt"
        >
          {{ vt === 'list' ? 'List' : vt === 'detailed' ? 'Detailed List' : vt === 'graph' ? 'Graph' : 'Folder' }}
        </button>
      </div>
    </DataSearchPanel>

    <!-- Module List View -->
    <div v-if="viewType === 'list'">
      <ModulesFlatList :modules="filteredModules" @select="openModule" />
    </div>

    <!-- Detailed List View -->
    <div v-else-if="viewType === 'detailed'">
      <ModulesDetailedList :modules="filteredModules" @select="openModule" />
    </div>

    <!-- Graph View -->
    <div v-else-if="viewType === 'graph'">
      <ModulesGraph :modules="filteredModules" @select="openModule" />
    </div>

    <!-- Folder View -->
    <div v-else-if="viewType === 'folder'">
      <ModulesFolder :modules="filteredModules" @select="openModule" />
    </div>

    <div v-if="!filteredModules.length" py8 text-center op50>
      No modules match the current filters
    </div>

    <div text-xs op30 text-right>
      {{ filteredModules.length }} of {{ modules.length }} modules
    </div>
  </div>
</template>
