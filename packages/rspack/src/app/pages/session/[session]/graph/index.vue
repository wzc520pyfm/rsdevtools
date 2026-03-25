<script setup lang="ts">
import type { BuildSession, ModuleData } from '../../../../../shared/types'
import type { ClientSettings } from '~/state/settings'
import { computedWithControl, watchDebounced } from '@vueuse/core'
import Fuse from 'fuse.js'
import { computed, inject, ref } from 'vue'
import { settings } from '~/state/settings'
import { getFileTypeFromModuleId, ModuleTypeRules } from '~/utils/icon'

function toArray<T>(val: T | T[]): T[] {
  return Array.isArray(val) ? val : [val]
}

function clearUndefined<T extends Record<string, any>>(obj: T): T {
  const result = {} as any
  for (const key in obj) {
    if (obj[key] !== undefined) result[key] = obj[key]
  }
  return result
}

const route = useRoute()
const router = useRouter()
const session = inject<Ref<BuildSession | null>>('session')!

const searchValue = ref<{
  search: string | false
  selected: string[] | null
  [key: string]: any
}>({
  search: (route.query.search || '') as string,
  selected: (route.query.file_types ? toArray(route.query.file_types) : null) as string[] | null,
  node_modules: (route.query.node_modules ? toArray(route.query.node_modules) : null) as string[] | null,
})

const moduleViewTypes = [
  {
    label: 'List',
    value: 'list',
    icon: 'i-ph-list-bullets-duotone',
  },
  {
    label: 'Detailed List',
    value: 'detailed-list',
    icon: 'i-ph-list-magnifying-glass-duotone',
  },
  {
    label: 'Graph',
    value: 'graph',
    icon: 'i-ph-graph-duotone',
  },
  {
    label: 'Folder',
    value: 'folder',
    icon: 'i-ph-folder-duotone',
  },
] as const

watchDebounced(
  searchValue.value,
  (f) => {
    const query: any = {
      ...route.query,
      search: f.search || undefined,
      file_types: f.selected || undefined,
      node_modules: f.node_modules || undefined,
    }
    router.replace({
      query: clearUndefined(query),
    })
  },
  { debounce: 500 },
)

const modules = computed(() => session.value?.modules ?? [])

const searchFilterTypes = computed(() => {
  return ModuleTypeRules.filter((rule) => {
    return modules.value.some(mod => rule.match.test(mod.name))
  })
})

const filtered = computed(() => {
  let result = modules.value
  if (searchValue.value.selected) {
    result = result.filter((mod) => {
      const type = getFileTypeFromModuleId(mod.name)
      return searchValue.value.selected!.includes(type.name)
    })
  }
  return result
})

const fuse = computedWithControl(
  () => filtered.value,
  () => new Fuse(filtered.value, {
    includeScore: true,
    keys: ['name'],
    ignoreLocation: true,
    threshold: 0.4,
  }),
)

const searched = computed<ModuleData[]>(() => {
  if (!searchValue.value.search) {
    return filtered.value
  }
  return fuse.value
    .search(searchValue.value.search)
    .map(r => r.item)
})

function toggleDisplay(type: ClientSettings['moduleGraphViewType']) {
  if (route.query.module) {
    router.replace({ query: { ...route.query, module: undefined } })
  }
  settings.value.moduleGraphViewType = type
}

function openModule(mod: ModuleData) {
  router.push({ query: { ...route.query, module: mod.id } })
}
</script>

<template>
  <div relative max-h-screen of-hidden>
    <div absolute left-4 top-4 z-panel-nav>
      <DataSearchPanel v-model="searchValue" :rules="searchFilterTypes">
        <div flex="~ gap-2 items-center" p2 border="t base">
          <span op50 pl2 text-sm>View as</span>
          <button
            v-for="viewType of moduleViewTypes"
            :key="viewType.value"
            btn-action
            :class="settings.moduleGraphViewType === viewType.value ? 'bg-active' : 'grayscale op50'"
            @click="toggleDisplay(viewType.value)"
          >
            <div :class="viewType.icon" />
            {{ viewType.label }}
          </button>
        </div>
      </DataSearchPanel>
    </div>

    <template v-if="settings.moduleGraphViewType === 'list'">
      <div of-auto h-screen pt-45>
        <ModulesFlatList
          :session="session"
          :modules="searched"
          @select="openModule"
        />
        <div
          absolute bottom-4 py-1 px-2 bg-glass left="1/2" translate-x="-1/2" border="~ base rounded-full" text="center xs"
        >
          <span op50>{{ searched.length }} of {{ modules.length }}</span>
        </div>
      </div>
    </template>
    <template v-else-if="settings.moduleGraphViewType === 'detailed-list'">
      <div of-auto h-screen pt-45>
        <ModulesDetailedList
          :session="session"
          :modules="searched"
          @select="openModule"
        />
        <div
          absolute bottom-4 py-1 px-2 bg-glass left="1/2" translate-x="-1/2" border="~ base rounded-full" text="center xs"
        >
          <span op50>{{ searched.length }} of {{ modules.length }}</span>
        </div>
      </div>
    </template>
    <template v-else-if="settings.moduleGraphViewType === 'graph'">
      <ModulesGraph
        :modules="searched"
        @select="openModule"
      />
    </template>
    <template v-else>
      <ModulesFolder
        :session="session"
        :modules="searched"
        @select="openModule"
      />
    </template>
  </div>
</template>
