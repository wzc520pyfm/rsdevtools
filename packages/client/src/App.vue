<script setup lang="ts">
import { useRpc } from '@/composables/rpc'

const { connected } = useRpc()
</script>

<template>
  <div class="min-h-screen bg-gray-50 dark:bg-gray-950 text-gray-900 dark:text-gray-100">
    <Transition enter-active-class="transition-all duration-300" leave-active-class="transition-all duration-200"
      enter-from-class="-translate-y-full opacity-0" leave-to-class="-translate-y-full opacity-0">
      <div v-if="!connected" class="fixed top-0 left-0 right-0 z-50 bg-yellow-500 text-yellow-900 text-sm py-1.5 px-4 flex items-center justify-center gap-2 shadow-md">
        <div class="i-carbon-warning animate-pulse" />
        Connecting to DevTools server...
      </div>
    </Transition>
    <router-view />
  </div>
</template>
