<script setup lang="ts">
import { computed } from 'vue'
import { isDark } from '../composables/dark'

const theme = computed(() => isDark.value ? 'white' : 'black')
</script>

<template>
  <div class="flex gap-2 group" p4 relative>
    <h1 text-4xl font-bold tracking-tight>
      <span :style="{ color: theme === 'white' ? '#60a5fa' : '#2563eb' }">RSPACK</span>
      <span :style="{ color: theme }"> DEVTOOLS</span>
    </h1>
  </div>
</template>
