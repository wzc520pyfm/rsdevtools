<script setup lang="ts">
import type { BuildSession } from '../../../../shared/types'
import Fuse from 'fuse.js'

const route = useRoute()
const router = useRouter()
const session = inject<Ref<BuildSession | null>>('session')!

const search = ref('')

const plugins = computed(() => session.value?.plugins ?? [])

const filteredPlugins = computed(() => {
  if (!search.value) return plugins.value
  const fuse = new Fuse(plugins.value, { keys: ['name'], threshold: 0.3 })
  return fuse.search(search.value).map(r => r.item)
})

function openPlugin(name: string) {
  router.push({ query: { ...route.query, plugin: name } })
}
</script>

<template>
  <div flex="~ col gap-4">
    <DataSearchPanel v-model:search="search" />

    <PluginsFlatList :plugins="filteredPlugins" @select="openPlugin" />

    <div v-if="!filteredPlugins.length" py8 text-center op50>
      No plugins match the current filter
    </div>

    <div text-xs op30 text-right>
      {{ filteredPlugins.length }} of {{ plugins.length }} plugins
    </div>
  </div>
</template>
