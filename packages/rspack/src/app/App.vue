<script setup lang="ts">
import { useHead } from '#app/composables/head'
import { connect, connectionState } from './composables/rpc'
import './styles/global.css'
import './styles/splitpanes.css'
import '@rspack-devtools/ui/composables/dark'

useHead({
  title: 'Rspack DevTools',
})

connect()
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
