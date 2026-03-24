<script setup lang="ts">
import type { BuildSession } from '../../../../shared/types'
import { formatBytes } from '@rspack-devtools/ui/utils/format'
import { computed } from 'vue'

const session = inject<Ref<BuildSession | null>>('session')!

interface DataTableItem {
  title: string
  value: string | number | Date
  type?: 'string' | 'number' | 'duration' | 'badge' | 'error' | 'warning'
  icon: string
}

const dataTable = computed<DataTableItem[]>(() => {
  if (!session.value)
    return []
  return [
    {
      title: 'Build ID',
      value: session.value.id,
      icon: 'i-ph-hash-duotone',
    },
    {
      title: 'Created At',
      value: new Date(session.value.timestamp),
      icon: 'i-ph-clock-duotone',
    },
    {
      title: 'Build Duration',
      value: session.value.duration,
      icon: 'i-ph-timer-duotone',
      type: 'duration',
    },
    {
      title: 'Directory',
      value: session.value.cwd,
      icon: 'i-ph-folder-duotone',
    },
    {
      title: 'Total Modules',
      value: session.value.modules.length,
      icon: 'i-ph-files-duotone',
      type: 'number',
    },
    {
      title: 'Plugins',
      value: session.value.plugins.length,
      icon: 'i-ph-plugs-duotone',
      type: 'number',
    },
    {
      title: 'Platform',
      value: session.value.target,
      icon: 'i-ph-cpu-duotone',
      type: 'badge',
    },
    {
      title: 'Format',
      value: session.value.outputType,
      icon: 'i-ph-file-duotone',
      type: 'badge',
    },
    {
      title: 'Errors',
      value: session.value.errors.length,
      icon: 'i-ph-warning-circle-duotone',
      type: 'error',
    },
    {
      title: 'Warnings',
      value: session.value.warnings.length,
      icon: 'i-ph-warning-duotone',
      type: 'warning',
    },
  ]
})
</script>

<template>
  <div v-if="session" flex="~ col gap-6" p6>
    <div flex="~ gap-2">
      <NuxtLink to="/" btn-action text-sm>
        <div i-ph-arrow-bend-up-left-duotone />
        Re-select Session
      </NuxtLink>
    </div>

    <!-- Meta Info -->
    <section>
      <div op50 mb2>
        Meta Info
      </div>
      <div border="~ base rounded" p4 grid="~ cols-[max-content_160px_2fr] gap-2 items-center">
        <template v-for="item of dataTable" :key="item.title">
          <div :class="item.icon" />
          <div>
            {{ item.title }}
          </div>
          <div font-mono>
            <time v-if="(item.value instanceof Date)" :datetime="item.value.toISOString()">{{ item.value.toLocaleString() }}</time>
            <DisplayDuration v-else-if="item.type === 'duration'" :duration="+item.value" />
            <DisplayBadge v-else-if="item.type === 'badge'" :text="String(item.value)" py1 />
            <DisplayNumberBadge
              v-else-if="item.type === 'error'"
              :number="+item.value"
              :color="+item.value > 0 ? 'badge-color-red' : 'badge-color-gray op75'"
            />
            <DisplayNumberBadge
              v-else-if="item.type === 'warning'"
              :number="+item.value"
              :color="+item.value > 0 ? 'badge-color-yellow' : 'badge-color-gray op75'"
            />
            <DisplayNumberBadge v-else-if="typeof item.value === 'number'" :number="item.value" py1 rounded-full inline-block text-sm />
            <span v-else>{{ item.value }}</span>
          </div>
        </template>
      </div>
    </section>

    <!-- Build Entries -->
    <section v-if="session.entrypoints.length">
      <div op50 mb2>
        Build Entries
      </div>
      <div border="~ base rounded" p4>
        <NuxtLink
          v-for="entry in session.entrypoints" :key="entry.name"
          :to="{ query: { entry: entry.name } }"
          flex="~ gap-2 items-center" py1
          cursor-pointer hover="op80"
        >
          <div i-ph-file-code text-sm op50 />
          <span font-mono text-sm>{{ entry.name }}</span>
          <DisplayBadge text="entry" :color="120" />
          <span text-xs op50>{{ formatBytes(entry.size) }}</span>
        </NuxtLink>
      </div>
    </section>

    <!-- Views -->
    <section>
      <div op50 mb2>
        Views
      </div>
      <div grid grid-cols-5 gap-3>
        <NuxtLink
          :to="`/session/${session.id}/graph`"
          border="~ base" rounded-lg p4 flex="~ col items-center gap-2"
          hover="bg-active border-active"
        >
          <div i-ph-graph-duotone text-2xl />
          <span text-sm>Modules Graph</span>
        </NuxtLink>
        <NuxtLink
          :to="`/session/${session.id}/plugins`"
          border="~ base" rounded-lg p4 flex="~ col items-center gap-2"
          hover="bg-active border-active"
        >
          <div i-ph-plug-duotone text-2xl />
          <span text-sm>Plugins</span>
        </NuxtLink>
        <NuxtLink
          :to="`/session/${session.id}/chunks`"
          border="~ base" rounded-lg p4 flex="~ col items-center gap-2"
          hover="bg-active border-active"
        >
          <div i-ph-stack-duotone text-2xl />
          <span text-sm>Chunks</span>
        </NuxtLink>
        <NuxtLink
          :to="`/session/${session.id}/assets`"
          border="~ base" rounded-lg p4 flex="~ col items-center gap-2"
          hover="bg-active border-active"
        >
          <div i-ph-files-duotone text-2xl />
          <span text-sm>Assets</span>
        </NuxtLink>
        <NuxtLink
          :to="`/session/${session.id}/packages`"
          border="~ base" rounded-lg p4 flex="~ col items-center gap-2"
          hover="bg-active border-active"
        >
          <div i-ph-package-duotone text-2xl />
          <span text-sm>Packages</span>
        </NuxtLink>
      </div>
    </section>
  </div>
</template>
