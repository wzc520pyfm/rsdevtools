<script setup lang="ts">
import { useRoute, useRouter } from 'vue-router'
import { ref, computed, onMounted } from 'vue'
import { useRpc, formatBytes, formatDuration } from '@/composables/rpc'

const route = useRoute()
const router = useRouter()
const { call } = useRpc()

const comparison = ref<any>(null)
const loading = ref(true)

const sessionIds = computed(() => (route.params.ids as string).split(','))

onMounted(async () => {
  try {
    comparison.value = await call('rspack:compare-sessions', { sessions: sessionIds.value })
  } catch (e) { console.error(e) }
  loading.value = false
})

function formatValue(v: number, type: string): string {
  if (type === 'size') return formatBytes(v)
  if (type === 'duration') return formatDuration(v)
  return String(v)
}

function getDelta(values: number[]): { delta: number; percent: string; direction: 'up' | 'down' | 'same' } {
  const [a, b] = values
  const delta = b - a
  const percent = a === 0 ? '∞' : `${((delta / a) * 100).toFixed(1)}%`
  return { delta, percent, direction: delta > 0 ? 'up' : delta < 0 ? 'down' : 'same' }
}
</script>

<template>
  <div class="min-h-screen p-8">
    <div class="max-w-4xl mx-auto">
      <button class="btn-ghost mb-6 text-sm" @click="router.push('/')">
        <div class="i-carbon-arrow-left mr-1" /> Back to Sessions
      </button>

      <h1 class="text-2xl font-bold mb-6 flex items-center gap-2">
        <div class="i-carbon-compare text-blue-500" /> Session Comparison
      </h1>

      <div v-if="loading" class="flex items-center justify-center py-20">
        <div class="i-carbon-renew animate-spin mr-2 text-gray-400" /> Loading comparison...
      </div>

      <div v-else-if="!comparison" class="text-center py-20 text-gray-500">
        Could not compare these sessions.
      </div>

      <div v-else class="space-y-4">
        <!-- Session labels -->
        <div class="grid grid-cols-[1fr_150px_150px_100px] gap-2 items-center px-4 text-xs text-gray-500 uppercase tracking-wide font-semibold">
          <div>Metric</div>
          <div class="text-right">Session A</div>
          <div class="text-right">Session B</div>
          <div class="text-right">Change</div>
        </div>

        <div v-for="metric in comparison.metrics" :key="metric.label"
          class="card grid grid-cols-[1fr_150px_150px_100px] gap-2 items-center px-4 py-3">
          <div class="font-medium text-sm">{{ metric.label }}</div>
          <div class="text-right font-mono text-sm">{{ formatValue(metric.values[0], metric.type) }}</div>
          <div class="text-right font-mono text-sm">{{ formatValue(metric.values[1], metric.type) }}</div>
          <div class="text-right text-sm font-medium"
            :class="{
              'text-red-500': getDelta(metric.values).direction === 'up' && metric.type === 'size',
              'text-green-500': getDelta(metric.values).direction === 'down' && metric.type === 'size',
              'text-green-500 ': getDelta(metric.values).direction === 'down' && metric.type === 'duration',
              'text-red-500 ': getDelta(metric.values).direction === 'up' && metric.type === 'duration',
              'text-gray-400': getDelta(metric.values).direction === 'same',
            }"
          >
            <span v-if="getDelta(metric.values).direction === 'up'">+</span>
            {{ getDelta(metric.values).percent }}
          </div>
        </div>
      </div>
    </div>
  </div>
</template>
