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

const expandChunks = ref(true)
const expandAssets = ref(true)

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
    </div>

    <!-- Flowmap timeline content -->
    <div of-auto h-full pt-24 p4>
      <div select-none of-visible>
        <!-- Entry root node -->
        <div flex="~">
          <FlowmapNode :lines="{ bottom: true }">
            <template #content>
              <div i-ph-file-code text-sm />
              <span font-mono text-sm>{{ entry.name }}</span>
              <DisplayBadge text="entry" :color="120" />
              <span text-xs op50>{{ formatBytes(entry.size) }}</span>
            </template>
          </FlowmapNode>
        </div>

        <!-- Chunks section -->
        <FlowmapExpandable
          v-model:expanded="expandChunks"
          :expandable="entryChunks.length > 0"
          :class-root-node="entryChunks.length === 0 ? 'border-dashed' : ''"
          :active-start="true"
          :active-end="true"
        >
          <template #node>
            <div i-ph-stack-duotone />
            Chunk
            <span op50 text-xs>({{ entryChunks.length }})</span>
          </template>
          <template #container>
            <div>
              <FlowmapNode
                v-for="chunk of entryChunks"
                :key="chunk.id"
                :lines="{ top: true }"
                class-node-inline="gap-2 items-center"
                pl6
              >
                <template #inner>
                  <button
                    px3 py1 hover="bg-active" flex="~ inline gap-2 items-center"
                    @click="openChunk(chunk.id)"
                  >
                    <div flex="~ col gap-1 items-start" p1>
                      <div flex="~ gap-2 items-center">
                        <DisplayBadge :text="chunk.names.length ? chunk.names.join(', ') : `chunk`" />
                        <div op50 font-mono text-sm>
                          #{{ chunk.id }}
                        </div>
                      </div>
                      <div text-sm>
                        {{ chunk.moduleCount }} modules
                      </div>
                    </div>
                  </button>
                </template>
                <template #inline-after>
                  <DisplayBadge v-if="chunk.entry" text="entry" :color="120" />
                  <DisplayBadge v-if="chunk.initial" text="initial" :color="200" />
                </template>
              </FlowmapNode>
            </div>
          </template>
        </FlowmapExpandable>

        <!-- Assets section -->
        <FlowmapExpandable
          v-model:expanded="expandAssets"
          :lines="{ top: true }"
          :expandable="entry.assets.length > 0"
          :class-root-node="entry.assets.length === 0 ? 'border-dashed' : ''"
          :active-start="true"
          :active-end="true"
          :show-tail="false"
          pl6 pt4
        >
          <template #node>
            <div i-ph-package-duotone />
            Assets
            <span op50 text-xs>({{ entry.assets.length }})</span>
          </template>
          <template #container>
            <div>
              <FlowmapNode
                v-for="asset of entry.assets"
                :key="asset.name"
                :lines="{ top: true }"
                class-node-inline="gap-2 items-center"
                pl6
              >
                <template #inner>
                  <button
                    px3 py1 hover="bg-active" flex="~ inline gap-2 items-center"
                    @click="openAsset(asset.name)"
                  >
                    <div flex="~ gap-2 items-center">
                      <div i-ph-file-duotone text-sm op50 />
                      <span font-mono text-sm>{{ asset.name }}</span>
                    </div>
                  </button>
                </template>
                <template #inline-after>
                  <span text-xs op50>{{ formatBytes(asset.size) }}</span>
                  <DisplayBadge text="asset" />
                </template>
              </FlowmapNode>
            </div>
          </template>
        </FlowmapExpandable>

        <!-- Modules list (below the flow) -->
        <div v-if="entryModules.length" mt-8>
          <div op50 mb2 text-sm flex="~ items-center gap-1">
            <div i-ph-files-duotone />
            Modules ({{ entryModules.length }})
          </div>
          <div border="~ base" rounded-lg max-h-80 of-auto>
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
  </div>
</template>
