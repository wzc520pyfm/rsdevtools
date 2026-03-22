<script setup lang="ts">
import { useHead } from '#app/composables/head'
import { useRoute } from '#app/composables/router'
import { onMounted } from 'vue'
import { connect, connectionState } from './composables/rpc'
import { isDark } from '@rspack-devtools/ui/composables/dark'
import './styles/global.css'
import './styles/splitpanes.css'

useHead({
  title: 'Rspack DevTools',
})

connect()

const route = useRoute()

const isDockFrame = typeof window !== 'undefined' && window !== window.parent
if (isDockFrame) {
  document.documentElement.classList.add('dock-frame')
  isDark.value = true
}

onMounted(() => {
  if (isDockFrame) {
    document.documentElement.classList.add('dock-frame')
    isDark.value = true
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
