<script setup lang="ts">
import type { BuildSession, ChunkData } from '../../../../shared/types'
import Fuse from 'fuse.js'

const route = useRoute()
const router = useRouter()
const session = inject<Ref<BuildSession | null>>('session')!

const viewType = useLocalStorage('rspack-chunks-view', 'list')
const search = ref('')
const chunkFilter = ref<'all' | 'entry' | 'initial' | 'dynamic'>('all')

const chunks = computed(() => session.value?.chunks ?? [])

const filteredChunks = computed(() => {
  let result = chunks.value

  if (chunkFilter.value !== 'all') {
    if (chunkFilter.value === 'entry') result = result.filter(c => c.entry)
    else if (chunkFilter.value === 'initial') result = result.filter(c => c.initial)
    else if (chunkFilter.value === 'dynamic') result = result.filter(c => !c.entry && !c.initial)
  }

  if (search.value) {
    const fuse = new Fuse(result, { keys: ['id', 'names'], threshold: 0.3 })
    result = fuse.search(search.value).map(r => r.item)
  }

  return result
})

function openChunk(chunk: ChunkData) {
  router.push({ query: { ...route.query, chunk: chunk.id } })
}
</script>

<template>
  <div flex="~ col gap-4">
    <DataSearchPanel v-model:search="search">
      <template #search-end>
        <div flex="~ gap-1">
          <button
            v-for="f in (['all', 'entry', 'initial', 'dynamic'] as const)"
            :key="f"
            btn-action text-sm
            :class="{ 'btn-action-active': chunkFilter === f }"
            @click="chunkFilter = f"
          >
            {{ f }}
          </button>
        </div>
      </template>
      <div flex="~ gap-1">
        <button
          v-for="vt in ['list', 'detailed', 'graph', 'treemap', 'sunburst', 'flamegraph']"
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
      <ChunksFlatList :chunks="filteredChunks" @select="openChunk" />
    </div>

    <div v-else-if="viewType === 'treemap'">
      <ChartTreemap :data="filteredChunks" name-key="id" size-key="size" @select="openChunk" />
    </div>

    <div v-else-if="viewType === 'sunburst'">
      <ChunksSunburst :chunks="filteredChunks" @select="openChunk" />
    </div>

    <div v-else-if="viewType === 'flamegraph'">
      <ChunksFlamegraph :chunks="filteredChunks" @select="openChunk" />
    </div>

    <div v-else-if="viewType === 'graph'">
      <ChunksGraph :chunks="filteredChunks" @select="openChunk" />
    </div>

    <div v-else-if="viewType === 'detailed'">
      <ChunksFlatList :chunks="filteredChunks" detailed @select="openChunk" />
    </div>

    <div v-if="!filteredChunks.length" py8 text-center op50>
      No chunks match the current filters
    </div>

    <div text-xs op30 text-right>
      {{ filteredChunks.length }} of {{ chunks.length }} chunks
    </div>
  </div>
</template>
