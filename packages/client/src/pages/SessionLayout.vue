<script setup lang="ts">
import { useRoute, useRouter } from 'vue-router'
import { ref, computed, onMounted, provide } from 'vue'
import { useRpc } from '@/composables/rpc'

const route = useRoute()
const router = useRouter()
const { call } = useRpc()

const session = ref<any>(null)
const loading = ref(true)

const sessionId = computed(() => route.params.id as string)

const navItems = [
  { to: '', label: 'Overview', icon: 'i-carbon-dashboard' },
  { to: 'modules', label: 'Modules', icon: 'i-carbon-document-multiple-01' },
  { to: 'chunks', label: 'Chunks', icon: 'i-carbon-cube' },
  { to: 'assets', label: 'Assets', icon: 'i-carbon-folder' },
  { to: 'graph', label: 'Graph', icon: 'i-carbon-network-3' },
  { to: 'errors', label: 'Errors', icon: 'i-carbon-warning-alt' },
]

async function loadSession() {
  loading.value = true
  try {
    session.value = await call('rspack:get-session', { session: sessionId.value })
  } catch (e) {
    console.error('Failed to load session:', e)
  }
  loading.value = false
}

onMounted(loadSession)

provide('session', session)
provide('sessionId', sessionId)

function isActive(to: string) {
  const currentPath = route.path
  const basePath = `/session/${sessionId.value}`
  if (to === '') return currentPath === basePath || currentPath === `${basePath}/`
  return currentPath === `${basePath}/${to}`
}
</script>

<template>
  <div class="flex h-screen">
    <!-- Sidebar -->
    <nav class="w-56 bg-white dark:bg-gray-900 border-r border-gray-200 dark:border-gray-800 flex flex-col shrink-0">
      <div class="p-4 border-b border-gray-200 dark:border-gray-800">
        <router-link
          to="/"
          class="flex items-center gap-2 text-sm text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 transition-colors"
        >
          <div class="i-carbon-arrow-left" />
          All Sessions
        </router-link>
        <div class="mt-3 flex items-center gap-2">
          <div class="i-carbon-cube text-blue-500" />
          <span class="text-sm font-bold bg-gradient-to-r from-blue-500 to-cyan-400 bg-clip-text text-transparent">
            Rspack DevTools
          </span>
        </div>
      </div>

      <div class="flex-1 p-2 flex flex-col gap-0.5">
        <router-link
          v-for="item in navItems"
          :key="item.to"
          :to="`/session/${sessionId}/${item.to}`"
          class="flex items-center gap-3 px-3 py-2 rounded-md text-sm transition-colors"
          :class="isActive(item.to)
            ? 'bg-blue-50 dark:bg-blue-950 text-blue-600 dark:text-blue-400 font-medium'
            : 'text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800'
          "
        >
          <div :class="item.icon" />
          {{ item.label }}
          <span
            v-if="item.to === 'errors' && session"
            class="ml-auto"
          >
            <span
              v-if="session.errors.length > 0"
              class="badge-red"
            >{{ session.errors.length }}</span>
            <span
              v-else-if="session.warnings.length > 0"
              class="badge-yellow"
            >{{ session.warnings.length }}</span>
          </span>
        </router-link>
      </div>

      <div class="p-4 border-t border-gray-200 dark:border-gray-800 text-xs text-gray-400">
        <div class="truncate font-mono">{{ sessionId }}</div>
      </div>
    </nav>

    <!-- Main content -->
    <main class="flex-1 overflow-auto bg-gray-50 dark:bg-gray-950">
      <div v-if="loading" class="flex items-center justify-center h-full">
        <div class="flex items-center gap-2 text-gray-400">
          <div class="i-carbon-renew animate-spin" />
          Loading session...
        </div>
      </div>
      <router-view v-else :session="session" :session-id="sessionId" />
    </main>
  </div>
</template>
