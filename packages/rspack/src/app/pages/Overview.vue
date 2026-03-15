<script setup lang="ts">
import { formatBytes, formatDuration, useRpc } from '@/composables/rpc'
import { computed } from 'vue'
import { useRouter } from 'vue-router'

const props = defineProps<{ session: any; sessionId: string }>()
const router = useRouter()
const { call } = useRpc()

const stats = computed(() => {
  if (!props.session) return []
  const s = props.session
  return [
    { title: 'Build Duration', value: formatDuration(s.duration), icon: 'i-carbon-timer', color: 'text-blue-500' },
    { title: 'Modules', value: s.modules.length, icon: 'i-carbon-document-multiple-01', color: 'text-green-500' },
    { title: 'Chunks', value: s.chunks.length, icon: 'i-carbon-cube', color: 'text-purple-500' },
    { title: 'Assets', value: s.assets.length, icon: 'i-carbon-folder', color: 'text-orange-500' },
    { title: 'Plugins', value: s.plugins?.length ?? 0, icon: 'i-carbon-plug', color: 'text-indigo-500' },
    { title: 'Packages', value: s.packages?.length ?? 0, icon: 'i-carbon-package', color: 'text-teal-500' },
    { title: 'Errors', value: s.errors.length, icon: 'i-carbon-error', color: s.errors.length > 0 ? 'text-red-500' : 'text-gray-400' },
    { title: 'Warnings', value: s.warnings.length, icon: 'i-carbon-warning', color: s.warnings.length > 0 ? 'text-yellow-500' : 'text-gray-400' },
  ]
})

const totalSize = computed(() => props.session?.assets?.reduce((s: number, a: any) => s + (a.size ?? 0), 0) ?? 0)
const duplicatePkgs = computed(() => (props.session?.packages ?? []).filter((p: any) => p.isDuplicate))

const modulesByType = computed(() => {
  if (!props.session) return []
  const typeMap = new Map<string, number>()
  for (const m of props.session.modules) {
    const ext = m.name.split('.').pop() ?? 'unknown'
    typeMap.set(ext, (typeMap.get(ext) ?? 0) + 1)
  }
  return Array.from(typeMap.entries()).sort((a, b) => b[1] - a[1]).slice(0, 10).map(([type, count]) => ({ type, count }))
})

const topModules = computed(() => {
  if (!props.session) return []
  return [...props.session.modules].sort((a: any, b: any) => b.size - a.size).slice(0, 10)
})

const topPackages = computed(() => {
  if (!props.session?.packages) return []
  return [...props.session.packages].sort((a: any, b: any) => b.size - a.size).slice(0, 8)
})

function openInEditor(path: string) {
  call('rspack:open-in-editor', { path }).catch(() => {})
}

function openInFinder(path: string) {
  call('rspack:open-in-finder', { path }).catch(() => {})
}
</script>

<template>
  <div class="p-6 space-y-6">
    <div class="flex items-center justify-between">
      <h1 class="text-2xl font-bold">Build Overview</h1>
      <div class="flex items-center gap-4 text-sm text-gray-500">
        <div class="flex items-center gap-1"><div class="i-carbon-calendar" /> {{ new Date(session.timestamp).toLocaleString() }}</div>
        <button class="btn-ghost text-xs" @click="openInFinder(session.cwd)" v-if="session.cwd">
          <div class="i-carbon-folder mr-1" /> Open Folder
        </button>
      </div>
    </div>

    <div class="grid grid-cols-2 md:grid-cols-4 gap-4">
      <div v-for="stat in stats" :key="stat.title" class="card p-4">
        <div class="flex items-center gap-2 mb-2">
          <div :class="[stat.icon, stat.color]" class="text-lg" />
          <span class="text-xs text-gray-500 uppercase tracking-wide">{{ stat.title }}</span>
        </div>
        <div class="text-2xl font-bold font-mono">{{ stat.value }}</div>
      </div>
    </div>

    <div class="card p-4">
      <div class="flex items-center justify-between">
        <div class="flex items-center gap-2"><div class="i-carbon-data-volume text-lg text-cyan-500" /><span class="font-medium">Total Output Size</span></div>
        <span class="text-2xl font-bold font-mono text-cyan-500">{{ formatBytes(totalSize) }}</span>
      </div>
    </div>

    <!-- Duplicate packages warning -->
    <div v-if="duplicatePkgs.length > 0" class="card border-l-4 border-l-yellow-500 p-4">
      <h2 class="text-sm font-semibold flex items-center gap-2 mb-2">
        <div class="i-carbon-warning text-yellow-500" /> {{ duplicatePkgs.length }} Duplicate Packages Detected
      </h2>
      <div class="flex flex-wrap gap-2">
        <span v-for="pkg in duplicatePkgs" :key="pkg.name" class="badge-yellow text-xs font-mono cursor-pointer"
          @click="router.push(`/session/${sessionId}/packages`)">
          {{ pkg.name }} ({{ pkg.instances.length }} versions)
        </span>
      </div>
    </div>

    <div class="grid grid-cols-1 lg:grid-cols-2 gap-6">
      <div class="card p-4">
        <h2 class="text-lg font-semibold mb-4 flex items-center gap-2"><div class="i-carbon-chart-bar text-blue-500" /> Modules by Type</h2>
        <div class="space-y-2">
          <div v-for="item in modulesByType" :key="item.type" class="flex items-center gap-3">
            <span class="badge-gray font-mono w-16 text-center">.{{ item.type }}</span>
            <div class="flex-1 h-6 bg-gray-100 dark:bg-gray-800 rounded-full overflow-hidden">
              <div class="h-full bg-blue-500/20 rounded-full flex items-center px-2"
                :style="{ width: `${Math.max(10, (item.count / (modulesByType[0]?.count ?? 1)) * 100)}%` }">
                <span class="text-xs font-mono font-medium">{{ item.count }}</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div class="card p-4">
        <h2 class="text-lg font-semibold mb-4 flex items-center gap-2"><div class="i-carbon-scale text-orange-500" /> Largest Modules</h2>
        <div class="space-y-2">
          <div v-for="mod in topModules" :key="mod.id" class="flex items-center gap-3 text-sm group">
            <span class="badge-blue font-mono shrink-0">{{ formatBytes(mod.size) }}</span>
            <span class="truncate text-gray-600 dark:text-gray-400 font-mono text-xs flex-1" :title="mod.name">{{ mod.name }}</span>
            <button class="opacity-0 group-hover:opacity-100 btn-ghost p-1 text-xs" @click="openInEditor(mod.name)" title="Open in editor">
              <div class="i-carbon-launch" />
            </button>
          </div>
        </div>
      </div>

      <!-- Top Packages -->
      <div v-if="topPackages.length > 0" class="card p-4">
        <h2 class="text-lg font-semibold mb-4 flex items-center gap-2"><div class="i-carbon-package text-teal-500" /> Largest Packages</h2>
        <div class="space-y-2">
          <div v-for="pkg in topPackages" :key="pkg.name" class="flex items-center gap-3 text-sm">
            <span class="badge-green font-mono shrink-0">{{ formatBytes(pkg.size) }}</span>
            <span class="font-mono text-xs flex-1">{{ pkg.name }}</span>
            <span v-if="pkg.isDuplicate" class="badge-yellow text-xs">dup</span>
            <span class="text-xs text-gray-400">{{ pkg.moduleCount }} mod</span>
          </div>
        </div>
      </div>

      <!-- Plugins summary -->
      <div v-if="session.plugins?.length > 0" class="card p-4">
        <h2 class="text-lg font-semibold mb-4 flex items-center gap-2"><div class="i-carbon-plug text-purple-500" /> Plugins ({{ session.plugins.length }})</h2>
        <div class="flex flex-wrap gap-2">
          <span v-for="p in session.plugins" :key="p.name" class="badge-gray text-xs font-mono">{{ p.name }}</span>
        </div>
      </div>
    </div>

    <div v-if="session.entrypoints?.length" class="card p-4">
      <h2 class="text-lg font-semibold mb-4 flex items-center gap-2"><div class="i-carbon-login text-green-500" /> Entrypoints</h2>
      <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
        <div v-for="ep in session.entrypoints" :key="ep.name" class="border border-gray-200 dark:border-gray-800 rounded-lg p-3">
          <div class="font-medium font-mono text-sm mb-1">{{ ep.name }}</div>
          <div class="flex items-center gap-2 text-xs text-gray-500">
            <span>{{ ep.chunks.length }} chunks</span><span>&middot;</span>
            <span>{{ ep.assets.length }} assets</span><span>&middot;</span>
            <span class="font-medium">{{ formatBytes(ep.size) }}</span>
          </div>
        </div>
      </div>
    </div>

    <div class="text-center text-xs text-gray-400 font-mono py-4">Build Hash: {{ session.hash }}</div>
  </div>
</template>
