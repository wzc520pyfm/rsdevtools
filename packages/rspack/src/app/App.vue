<script setup lang="ts">
import { useHead } from '#app/composables/head'
import { useRoute } from '#app/composables/router'
import { onMounted } from 'vue'
import { connect, connectionState } from './composables/rpc'
import './styles/global.css'
import './styles/splitpanes.css'
import '@rspack-devtools/ui/composables/dark'

useHead({
  title: 'Rspack DevTools',
})

connect()

const route = useRoute()

const isDockFrame = typeof window !== 'undefined' && (window !== window.parent || route.path.startsWith('/dock'))
if (isDockFrame) {
  document.documentElement.classList.add('dock-frame')
}

onMounted(() => {
  if (isDockFrame) {
    document.documentElement.classList.add('dock-frame')
  }
})
</script>

<template>
  <div v-if="connectionState.error" text-red>
    {{ connectionState.error }}
  </div>
  <VisualLoading
    v-else-if="!connectionState.connected"
    text="Connecting..."
  />
  <div v-else h-vh>
    <NuxtPage />
  </div>
</template>
