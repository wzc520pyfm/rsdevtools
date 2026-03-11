<script setup lang="ts">
import { useRpc } from '@/composables/rpc'

const { connected } = useRpc()
</script>

<template>
  <div class="min-h-screen bg-gray-50 dark:bg-gray-950 text-gray-900 dark:text-gray-100 font-sans">
    <div
      v-if="!connected"
      class="fixed top-0 left-0 right-0 z-50 bg-yellow-500/90 text-yellow-900 text-center py-1 text-xs font-medium"
    >
      Connecting to Rspack DevTools server...
    </div>
    <router-view />
  </div>
</template>
