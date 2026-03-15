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
  if (query.module) return 'module'
  if (query.asset) return 'asset'
  if (query.plugin) return 'plugin'
  if (query.chunk) return 'chunk'
  if (query.package) return 'package'
  return null
})

function closePanel() {
  const query = { ...route.query }
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

    <!-- Overlay detail panels -->
    <Teleport to="body">
      <div
        v-if="currentPanelType"
        fixed inset-0 z-100 flex items-center justify-center
      >
        <div absolute inset-0 bg-black:50 backdrop-blur-2 @click="closePanel" />
        <div
          relative z-10 bg-base border="~ base" rounded-xl shadow-2xl
          w="90%" max-w-4xl h="80%" max-h-90vh
          flex="~ col" of-hidden
        >
          <div flex="~ items-center justify-between" p3 border="b base">
            <span font-medium capitalize>{{ currentPanelType }} Details</span>
            <DisplayCloseButton @click="closePanel" />
          </div>
          <div flex-1 of-auto p4>
            <DataModuleDetailsLoader
              v-if="currentPanelType === 'module'"
              :session-id="sessionId"
              :module-id="(route.query.module as string)"
            />
            <DataAssetDetailsLoader
              v-if="currentPanelType === 'asset'"
              :session-id="sessionId"
              :asset-name="(route.query.asset as string)"
            />
            <DataPluginDetailsLoader
              v-if="currentPanelType === 'plugin'"
              :session-id="sessionId"
              :plugin-name="(route.query.plugin as string)"
            />
            <DataChunkDetailsLoader
              v-if="currentPanelType === 'chunk'"
              :session-id="sessionId"
              :chunk-id="(route.query.chunk as string)"
            />
            <DataPackageDetailsLoader
              v-if="currentPanelType === 'package'"
              :session-id="sessionId"
              :package-name="(route.query.package as string)"
            />
          </div>
        </div>
      </div>
    </Teleport>
  </div>
</template>
