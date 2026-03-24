<script setup lang="ts">
import { computed } from 'vue'
import { formatBytes } from '@rspack-devtools/ui/utils/format'
import { useRpc } from '../../composables/rpc'

const props = defineProps<{
  sessionId: string
  packageName: string
}>()

const emit = defineEmits<{
  (e: 'close'): void
}>()

const name = computed(() => props.packageName.replace(/@[^@]*$/, ''))

const { call } = useRpc()
const { data: pkg, pending } = useAsyncData(
  `package-${props.sessionId}-${name.value}`,
  () => call('rspack:get-package-details', { session: props.sessionId, name: name.value }),
)
</script>

<template>
  <VisualLoading v-if="pending" text="Loading package..." />
  <div v-else-if="!pkg" h-full flex items-center justify-center>
    <span op50>Package not found</span>
  </div>
  <div v-else relative h-full w-full>
    <DisplayCloseButton
      absolute right-2 top-1.5 bg-glass z-10
      @click="emit('close')"
    />
    <div of-auto h-full p4 flex="~ col gap-4">
      <div flex="~ col gap-2">
        <h3 font-mono text-sm>{{ pkg.name }}</h3>
        <div flex="~ gap-4" text-xs op50>
          <span>Version: {{ pkg.version }}</span>
          <span>Size: {{ formatBytes(pkg.size) }}</span>
          <span>Modules: {{ pkg.moduleCount }}</span>
        </div>
        <div flex="~ gap-2">
          <DisplayBadge v-if="pkg.isDirect" text="direct" :color="120" />
          <DisplayBadge v-else text="transitive" :color="30" />
          <DisplayBadge v-if="pkg.isDuplicate" text="duplicate" :color="0" />
        </div>
      </div>
      <div v-if="pkg.instances?.length > 1">
        <h4 text-sm op50 mb1>Instances ({{ pkg.instances.length }})</h4>
        <div border="~ base" rounded-lg>
          <div v-for="inst in pkg.instances" :key="inst.path" px3 py2 border="b base last:b-0" text-xs>
            <div font-mono>{{ inst.path }}</div>
            <div op50>{{ inst.version }} - {{ formatBytes(inst.size) }}</div>
          </div>
        </div>
      </div>
      <div v-if="pkg.modules?.length">
        <h4 text-sm op50 mb1>Modules ({{ pkg.modules.length }})</h4>
        <div border="~ base" rounded-lg max-h-60 of-auto>
          <div v-for="mod in pkg.modules" :key="mod" px3 py1 text-xs font-mono border="b base last:b-0">
            {{ mod }}
          </div>
        </div>
      </div>
    </div>
  </div>
</template>
