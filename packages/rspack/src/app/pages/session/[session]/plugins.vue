<script setup lang="ts">
import type { BuildSession } from '../../../../shared/types'
import { computedWithControl, watchDebounced } from '@vueuse/core'
import Fuse from 'fuse.js'
import { DefaultPluginType, getPluginTypeFromName, PluginTypeRules } from '~/utils/icon'

const route = useRoute()
const router = useRouter()
const session = inject<Ref<BuildSession | null>>('session')!

function toArray<T>(val: T | T[]): T[] {
  return Array.isArray(val) ? val : [val]
}

function clearUndefined<T extends Record<string, any>>(obj: T): T {
  const result = {} as any
  for (const key in obj) {
    if (obj[key] !== undefined)
      result[key] = obj[key]
  }
  return result
}

const searchValue = ref<{ search: string, selected: string[] | null }>({
  search: (route.query.search || '') as string,
  selected: (route.query.plugin_types ? toArray(route.query.plugin_types) : null) as string[] | null,
})

const plugins = computed(() => session.value?.plugins ?? [])

const searchFilterTypes = computed(() => {
  return [
    ...PluginTypeRules.filter((rule) => {
      return plugins.value.some(item => rule.match.test(item.name))
    }),
    DefaultPluginType,
  ]
})

const filtered = computed(() => {
  let list = plugins.value

  if (searchValue.value.selected) {
    list = list.filter((plugin) => {
      const type = getPluginTypeFromName(plugin.name)
      return searchValue.value.selected!.includes(type.name)
    })
  }
  return list
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

const searched = computed(() => {
  if (!searchValue.value.search) {
    return filtered.value
  }
  return fuse.value
    .search(searchValue.value.search)
    .map(r => r.item)
})

watchDebounced(
  searchValue.value,
  (f) => {
    const query: any = {
      ...route.query,
      search: f.search || undefined,
      plugin_types: f.selected || undefined,
    }
    router.replace({
      query: clearUndefined(query),
    })
  },
  { debounce: 500 },
)
</script>

<template>
  <div relative max-h-screen of-hidden>
    <div absolute left-4 top-4 z-panel-nav>
      <DataSearchPanel v-model="searchValue" :rules="searchFilterTypes" />
    </div>
    <div of-auto h-screen flex="~ col gap-2" pt32>
      <PluginsFlatList :plugins="searched ?? []" />
      <div
        absolute bottom-4 py-1 px-2 bg-glass left="1/2" translate-x="-1/2" border="~ base rounded-full" text="center xs"
      >
        <span op50>{{ searched.length }} of {{ plugins.length }}</span>
      </div>
    </div>
  </div>
</template>
