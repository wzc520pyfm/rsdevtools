<script setup lang="ts">
import { formatBytes } from '@rspack-devtools/ui/utils/format'
import { useRpc } from '../../../composables/rpc'

const route = useRoute()
const { call } = useRpc()

const sessionIds = computed(() => (route.params.sessions as string).split(','))

const { data: comparison, pending } = useAsyncData(
  `compare-${sessionIds.value.join(',')}`,
  () => call('rspack:compare-sessions', { sessions: sessionIds.value }),
)

function formatMetricValue(value: number, type: string): string {
  if (type === 'size') return formatBytes(value)
  if (type === 'duration') return `${value}ms`
  return value.toLocaleString()
}

function getDiffClass(values: number[]): string {
  if (values.length < 2) return ''
  const diff = values[1] - values[0]
  if (diff > 0) return 'text-red-500'
  if (diff < 0) return 'text-green-500'
  return ''
}
</script>

<template>
  <div p4 flex="~ col gap-4">
    <div flex="~ items-center gap-2">
      <NuxtLink to="/" btn-action text-sm>
        <div i-ph-arrow-left />
        Back to Sessions
      </NuxtLink>
      <h2 text-lg font-medium>
        Session Comparison
      </h2>
    </div>

    <VisualLoading v-if="pending" text="Comparing sessions..." />

    <div v-else-if="!comparison" py8 text-center op50>
      Could not compare sessions
    </div>

    <div v-else>
      <!-- Session headers -->
      <div grid grid-cols-3 gap-4 mb4>
        <div />
        <CompareSessionMeta
          v-for="(s, i) in comparison.sessions"
          :key="s.id"
          :session="s"
          :label="`Session ${i + 1}`"
        />
      </div>

      <!-- Metrics -->
      <div flex="~ col gap-2">
        <div
          v-for="metric in comparison.metrics"
          :key="metric.label"
          grid grid-cols-3 gap-4 items-center py2 border="b base"
        >
          <span text-sm op75>{{ metric.label }}</span>
          <span
            v-for="(value, i) in metric.values"
            :key="i"
            font-mono text-sm
            :class="i > 0 ? getDiffClass(metric.values) : ''"
          >
            {{ formatMetricValue(value, metric.type) }}
          </span>
        </div>
      </div>
    </div>
  </div>
</template>
