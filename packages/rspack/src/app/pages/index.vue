<script setup lang="ts">
import { ref, computed } from 'vue'
import { useRpc } from '../composables/rpc'

const { call } = useRpc()

const sessionMode = ref<'list' | 'compare'>('list')
const selectedForCompare = ref<string[]>([])

const { data: sessions, pending } = useAsyncData('sessions', () =>
  call('rspack:list-sessions'),
)

const canCompare = computed(() => selectedForCompare.value.length === 2)

function toggleCompare(id: string) {
  const idx = selectedForCompare.value.indexOf(id)
  if (idx >= 0) {
    selectedForCompare.value.splice(idx, 1)
  }
  else if (selectedForCompare.value.length < 2) {
    selectedForCompare.value.push(id)
  }
}

function goToCompare() {
  if (canCompare.value) {
    navigateTo(`/compare/${selectedForCompare.value.join(',')}`)
  }
}
</script>

<template>
  <div p4 flex="~ col gap-4" items-center justify-center relative>
    <VisualLogoBanner />
    <p v-if="sessions?.length" op50>
      {{ sessionMode === 'list' ? 'Select a build session to get started:' : 'Select 2 build sessions to compare:' }}
    </p>
    <p v-else op50>
      No sessions yet, run a build to get started.
    </p>

    <div v-if="sessions?.length" flex="~ gap-2" mb2>
      <button
        btn-action text-sm
        :class="{ 'btn-action-active': sessionMode === 'list' }"
        @click="sessionMode = 'list'; selectedForCompare = []"
      >
        <div i-ph-list-duotone />
        List
      </button>
      <button
        btn-action text-sm
        :class="{ 'btn-action-active': sessionMode === 'compare' }"
        @click="sessionMode = 'compare'"
      >
        <div i-ph-git-diff-duotone />
        Compare
      </button>
      <button
        v-if="sessionMode === 'compare'"
        btn-action text-sm
        :disabled="!canCompare"
        @click="goToCompare"
      >
        Compare Selected
      </button>
    </div>

    <div v-if="pending" animate-pulse op50>
      Loading sessions...
    </div>

    <div v-else-if="sessions?.length" flex="~ col gap-2" w-full max-w-2xl>
      <NuxtLink
        v-for="session in sessions"
        :key="session.id"
        :to="sessionMode === 'list' ? `/session/${session.id}` : undefined"
        border="~ base rounded-lg"
        p3 flex="~ col gap-1"
        hover="bg-active"
        cursor-pointer
        :class="{
          'border-active bg-active': selectedForCompare.includes(session.id),
        }"
        @click="sessionMode === 'compare' ? toggleCompare(session.id) : undefined"
      >
        <div flex="~ gap-2" items-center>
          <span font-mono text-sm op75># {{ session.id }}</span>
        </div>
        <div flex="~ gap-2" items-center text-xs op50>
          <DisplayTimestamp :timestamp="session.timestamp" />
        </div>
      </NuxtLink>
    </div>
  </div>
</template>
