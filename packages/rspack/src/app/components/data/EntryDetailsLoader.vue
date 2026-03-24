<script setup lang="ts">
import type { BuildSession, ChunkData, ModuleData } from '../../../shared/types'
import { formatBytes } from '@rspack-devtools/ui/utils/format'
import { computed, ref } from 'vue'

const props = defineProps<{
  sessionId: string
  entryName: string
}>()

const emit = defineEmits<{
  (e: 'close'): void
}>()

const session = inject<Ref<BuildSession | null>>('session')!

const entry = computed(() => {
  return session.value?.entrypoints.find(e => e.name === props.entryName) ?? null
})

const entryChunks = computed<ChunkData[]>(() => {
  if (!entry.value || !session.value)
    return []
  return session.value.chunks.filter(c => entry.value!.chunks.includes(c.id))
})

const entryModules = computed<ModuleData[]>(() => {
  if (!session.value || !entryChunks.value.length)
    return []
  const moduleIds = new Set<string>()
  for (const chunk of entryChunks.value) {
    for (const modId of chunk.modules) {
      moduleIds.add(modId)
    }
  }
  return session.value.modules.filter(m => moduleIds.has(m.id))
})

type ViewType = 'overview' | 'chunks' | 'modules'
const viewType = ref<ViewType>('overview')

const route = useRoute()

function openModule(moduleId: string) {
  const router = useRouter()
  router.replace({ query: { ...route.query, entry: undefined, module: moduleId } })
}

function openChunk(chunkId: string) {
  const router = useRouter()
  router.replace({ query: { ...route.query, entry: undefined, chunk: chunkId } })
}

function openAsset(assetName: string) {
  const router = useRouter()
  router.replace({ query: { ...route.query, entry: undefined, asset: assetName } })
}
</script>

<template>
  <div v-if="!entry" h-full flex items-center justify-center>
    <span op50>Entry not found</span>
  </div>
  <div v-else relative h-full w-full>
    <DisplayCloseButton
      absolute right-2 top-1.5 bg-glass z-10
      @click="emit('close')"
    />

    <!-- Header card -->
    <div
      bg-glass absolute left-2 top-2 z-10 p2
      border="~ base rounded-lg"
      flex="~ col gap-2"
    >
      <div flex="~ items-center gap-2" px2 pt1>
        <div i-ph-file-code text-sm />
        <span font-mono text-sm>{{ entry.name }}</span>
        <DisplayBadge text="entry" :color="120" />
      </div>
      <div text-xs font-mono flex="~ items-center gap-3" ml2>
        <span flex="~ gap-1 items-center" op75>
          <span i-ph-stack-duotone inline-block />
          {{ entryChunks.length }} chunks
        </span>
        <span flex="~ gap-1 items-center" op75>
          <span i-ph-files-duotone inline-block />
          {{ entryModules.length }} modules
        </span>
        <span op40>|</span>
        <span flex="~ gap-1 items-center" op75>
          <span i-ph-database-duotone inline-block />
          {{ formatBytes(entry.size) }}
        </span>
      </div>
      <div flex="~ gap-2">
        <button
          :class="viewType === 'overview' ? 'text-primary' : ''"
          flex="~ gap-2 items-center justify-center"
          px2 py1 w-40
          border="~ base rounded-lg"
          hover="bg-active"
          @click="viewType = 'overview'"
        >
          <div i-ph-list-bullets-duotone />
          Overview
        </button>
        <button
          :class="viewType === 'chunks' ? 'text-primary' : ''"
          flex="~ gap-2 items-center justify-center"
          px2 py1 w-40
          border="~ base rounded-lg"
          hover="bg-active"
          @click="viewType = 'chunks'"
        >
          <div i-ph-stack-duotone />
          Chunks
        </button>
        <button
          :class="viewType === 'modules' ? 'text-primary' : ''"
          flex="~ gap-2 items-center justify-center"
          px2 py1 w-40
          border="~ base rounded-lg"
          hover="bg-active"
          @click="viewType = 'modules'"
        >
          <div i-ph-files-duotone />
          Modules
        </button>
      </div>
    </div>

    <!-- Content area -->
    <div of-auto h-full pt-30 px-4 pb-4>
      <!-- Overview tab -->
      <div v-if="viewType === 'overview'" flex="~ col gap-4">
        <!-- Assets -->
        <div v-if="entry.assets?.length">
          <h4 text-sm op50 mb2 flex="~ items-center gap-1">
            <div i-ph-file-duotone />
            Assets ({{ entry.assets.length }})
          </h4>
          <div border="~ base" rounded-lg of-hidden>
            <div
              v-for="asset in entry.assets" :key="asset.name"
              flex="~ gap-2 items-center" px3 py2 border="b base last:b-0"
              cursor-pointer hover="bg-active"
              @click="openAsset(asset.name)"
            >
              <div i-ph-file-duotone text-sm op50 />
              <span font-mono text-xs break-all flex-1>{{ asset.name }}</span>
              <DisplayBadge text="asset" />
              <span text-xs op50>{{ formatBytes(asset.size) }}</span>
            </div>
          </div>
        </div>

        <!-- Chunks summary -->
        <div v-if="entryChunks.length">
          <h4 text-sm op50 mb2 flex="~ items-center gap-1">
            <div i-ph-stack-duotone />
            Chunks ({{ entryChunks.length }})
          </h4>
          <div border="~ base" rounded-lg of-hidden>
            <div
              v-for="chunk in entryChunks" :key="chunk.id"
              flex="~ gap-2 items-center" px3 py2 border="b base last:b-0"
              cursor-pointer hover="bg-active"
              @click="openChunk(chunk.id)"
            >
              <div i-ph-stack-duotone text-sm op50 />
              <span font-mono text-xs flex-1>
                {{ chunk.names.length ? chunk.names.join(', ') : `#${chunk.id}` }}
              </span>
              <div flex="~ gap-2 items-center">
                <DisplayBadge v-if="chunk.entry" text="entry" :color="120" />
                <DisplayBadge v-if="chunk.initial" text="initial" :color="200" />
                <span text-xs op50>{{ chunk.moduleCount }} modules</span>
                <span text-xs op50>{{ formatBytes(chunk.size) }}</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Chunks tab -->
      <div v-if="viewType === 'chunks'" flex="~ col gap-4">
        <div v-for="chunk in entryChunks" :key="chunk.id" border="~ base" rounded-lg of-hidden>
          <div
            flex="~ gap-2 items-center" px3 py2 border="b base"
            cursor-pointer hover="bg-active"
            @click="openChunk(chunk.id)"
          >
            <div i-ph-stack-duotone text-sm op50 />
            <span font-mono text-sm font-medium flex-1>
              {{ chunk.names.length ? chunk.names.join(', ') : `Chunk #${chunk.id}` }}
            </span>
            <DisplayBadge v-if="chunk.entry" text="entry" :color="120" />
            <DisplayBadge v-if="chunk.initial" text="initial" :color="200" />
            <span text-xs op50>{{ formatBytes(chunk.size) }}</span>
          </div>
          <div v-if="chunk.files?.length" px3 py2 border="b base">
            <div text-xs op50 mb1>
              Files
            </div>
            <div flex="~ col gap-1">
              <div
                v-for="file in chunk.files" :key="file"
                flex="~ gap-2 items-center"
                cursor-pointer hover="op80"
                @click="openAsset(file)"
              >
                <div i-ph-file-duotone text-xs op50 />
                <span font-mono text-xs>{{ file }}</span>
              </div>
            </div>
          </div>
          <div px3 py2 text-xs op50>
            {{ chunk.moduleCount }} modules · {{ formatBytes(chunk.size) }}
          </div>
        </div>
      </div>

      <!-- Modules tab -->
      <div v-if="viewType === 'modules'">
        <div border="~ base" rounded-lg of-hidden>
          <div
            v-for="mod in entryModules" :key="mod.id"
            flex="~ gap-2 items-center" px3 py2 border="b base last:b-0"
            cursor-pointer hover="bg-active"
            @click="openModule(mod.id)"
          >
            <div i-ph-file-code text-sm op50 />
            <span font-mono text-xs break-all flex-1>{{ mod.name }}</span>
            <span text-xs op50>{{ mod.moduleType }}</span>
            <span text-xs op50>{{ formatBytes(mod.size) }}</span>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>
