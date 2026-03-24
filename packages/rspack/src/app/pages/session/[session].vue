<script setup lang="ts">
import type { BuildSession } from '../../../shared/types'
import { provide, ref, computed } from 'vue'
import { useSideNav } from '@rspack-devtools/ui/composables/nav'
import { useRpc } from '../../composables/rpc'

const route = useRoute()
const router = useRouter()
const { call } = useRpc()

const sessionId = computed(() => route.params.session as string)
const session = ref<BuildSession | null>(null)
const loading = ref(true)

provide('sessionId', sessionId)
provide('session', session)

async function loadSession() {
  loading.value = true
  session.value = await call('rspack:get-session', { session: sessionId.value })
  loading.value = false
}

watch(sessionId, loadSession, { immediate: true })

const currentPanelType = computed(() => {
  const query = route.query
  if (query.entry) return 'entry'
  if (query.module) return 'module'
  if (query.asset) return 'asset'
  if (query.plugin) return 'plugin'
  if (query.chunk) return 'chunk'
  if (query.package) return 'package'
  return null
})

function closePanel() {
  const query = { ...route.query }
  delete query.entry
  delete query.module
  delete query.asset
  delete query.plugin
  delete query.chunk
  delete query.package
  router.replace({ query })
}

function onKeydown(e: KeyboardEvent) {
  if (e.key === 'Escape' && currentPanelType.value) {
    closePanel()
  }
}

onMounted(() => {
  document.addEventListener('keydown', onKeydown)
})
onUnmounted(() => {
  document.removeEventListener('keydown', onKeydown)
})

useSideNav([
  { icon: 'i-ph-house-duotone', title: 'Overview', to: `/session/${sessionId.value}` },
  { icon: 'i-ph-graph-duotone', title: 'Modules', to: `/session/${sessionId.value}/graph` },
  { icon: 'i-ph-plug-duotone', title: 'Plugins', to: `/session/${sessionId.value}/plugins` },
  { icon: 'i-ph-stack-duotone', title: 'Chunks', to: `/session/${sessionId.value}/chunks` },
  { icon: 'i-ph-files-duotone', title: 'Assets', to: `/session/${sessionId.value}/assets` },
  { icon: 'i-ph-package-duotone', title: 'Packages', to: `/session/${sessionId.value}/packages` },
  { icon: 'i-ph-warning-duotone', title: 'Errors', to: `/session/${sessionId.value}/errors` },
])
</script>

<template>
  <div v-if="loading" h-full>
    <VisualLoading text="Loading session..." />
  </div>
  <div v-else-if="!session" h-full flex items-center justify-center>
    <p op50>
      Session not found
    </p>
  </div>
  <div v-else h-full relative>
    <PanelSideNav />
    <div pl-14 pt-6 pr-4 pb-4 h-full of-auto>
      <NuxtPage />
    </div>

    <!-- Overlay detail panels (side panel style, matching vite-devtools) -->
    <div
      v-if="currentPanelType" fixed inset-0
      backdrop-blur-8 backdrop-brightness-95 z-100
      @click.self="closePanel"
    >
      <div
        v-if="currentPanelType === 'entry'"
        :key="(route.query.entry as string)"
        fixed right-0 bottom-0 top-20 left-20 z-100
        bg-glass border="l t base rounded-tl-xl"
      >
        <DataEntryDetailsLoader
          :session-id="sessionId"
          :entry-name="(route.query.entry as string)"
          @close="closePanel"
        />
      </div>
      <div
        v-if="currentPanelType === 'module'"
        :key="(route.query.module as string)"
        fixed right-0 bottom-0 top-20 left-20 z-100
        bg-glass border="l t base rounded-tl-xl"
      >
        <DataModuleDetailsLoader
          :session-id="sessionId"
          :module-id="(route.query.module as string)"
          @close="closePanel"
        />
      </div>
      <div
        v-if="currentPanelType === 'asset'"
        :key="(route.query.asset as string)"
        fixed right-0 bottom-0 top-30 z-100 of-hidden
        bg-glass border="l t base rounded-tl-xl"
        class="left-20 xl:left-100 2xl:left-150"
      >
        <DataAssetDetailsLoader
          :session-id="sessionId"
          :asset-name="(route.query.asset as string)"
          @close="closePanel"
        />
      </div>
      <div
        v-if="currentPanelType === 'plugin'"
        :key="(route.query.plugin as string)"
        fixed right-0 bottom-0 top-20 left-20 z-100
        bg-glass border="l t base rounded-tl-xl"
      >
        <DataPluginDetailsLoader
          :session-id="sessionId"
          :plugin-name="(route.query.plugin as string)"
          @close="closePanel"
        />
      </div>
      <div
        v-if="currentPanelType === 'chunk'"
        :key="(route.query.chunk as string)"
        fixed right-0 bottom-0 top-20 z-100
        bg-glass border="l t base rounded-tl-xl"
        class="left-20 xl:left-100 2xl:left-150"
      >
        <DataChunkDetailsLoader
          :session-id="sessionId"
          :chunk-id="(route.query.chunk as string)"
          @close="closePanel"
        />
      </div>
      <div
        v-if="currentPanelType === 'package'"
        :key="(route.query.package as string)"
        fixed right-0 bottom-0 top-20 z-100
        bg-glass border="l t base rounded-tl-xl"
        class="left-20 xl:left-100 2xl:left-150"
      >
        <DataPackageDetailsLoader
          :session-id="sessionId"
          :package-name="(route.query.package as string)"
          @close="closePanel"
        />
      </div>
    </div>
  </div>
</template>
