<script setup lang="ts">
import type { BuildSession } from '../../../../shared/types'
import { formatBytes } from '@rspack-devtools/ui/utils/format'

const session = inject<Ref<BuildSession | null>>('session')!
</script>

<template>
  <div v-if="session" flex="~ col gap-6">
    <div flex="~ items-center gap-2">
      <NuxtLink to="/" btn-action text-sm>
        <div i-ph-arrow-left />
        Re-select Session
      </NuxtLink>
    </div>

    <!-- Meta Info -->
    <section>
      <h3 text-sm op50 mb2>
        Meta Info
      </h3>
      <div border="~ base" rounded-lg p4 flex="~ col gap-2">
        <div flex="~ gap-4" items-center>
          <span op50 w-36 text-sm># Build ID</span>
          <span font-mono text-sm>{{ session.id }}</span>
        </div>
        <div flex="~ gap-4" items-center>
          <span op50 w-36 text-sm>Created At</span>
          <span font-mono text-sm>{{ new Date(session.timestamp).toLocaleString() }}</span>
        </div>
        <div flex="~ gap-4" items-center>
          <span op50 w-36 text-sm>Build Duration</span>
          <DisplayDuration :duration="session.duration" />
        </div>
        <div flex="~ gap-4" items-center>
          <span op50 w-36 text-sm>Directory</span>
          <span font-mono text-sm break-all>{{ session.cwd }}</span>
        </div>
        <div flex="~ gap-4" items-center>
          <span op50 w-36 text-sm>Total Modules</span>
          <DisplayNumberBadge :number="session.modules.length" />
        </div>
        <div flex="~ gap-4" items-center>
          <span op50 w-36 text-sm>Plugins</span>
          <DisplayNumberBadge :number="session.plugins.length" />
        </div>
        <div flex="~ gap-4" items-center>
          <span op50 w-36 text-sm>Errors</span>
          <DisplayNumberBadge
            :number="session.errors.length"
            :color="session.errors.length > 0 ? 'badge-color-red' : 'badge-color-gray op75'"
          />
        </div>
        <div flex="~ gap-4" items-center>
          <span op50 w-36 text-sm>Warnings</span>
          <DisplayNumberBadge
            :number="session.warnings.length"
            :color="session.warnings.length > 0 ? 'badge-color-yellow' : 'badge-color-gray op75'"
          />
        </div>
      </div>
    </section>

    <!-- Build Entries -->
    <section v-if="session.entrypoints.length">
      <h3 text-sm op50 mb2>
        Build Entries
      </h3>
      <div border="~ base" rounded-lg p4>
        <div v-for="entry in session.entrypoints" :key="entry.name" flex="~ gap-2 items-center" py1>
          <div i-ph-file-code text-sm op50 />
          <span font-mono text-sm>{{ entry.name }}</span>
          <DisplayBadge text="entry" :color="120" />
          <span text-xs op50>{{ formatBytes(entry.size) }}</span>
        </div>
      </div>
    </section>

    <!-- Views -->
    <section>
      <h3 text-sm op50 mb2>
        Views
      </h3>
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
