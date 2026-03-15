<script setup lang="ts">
defineProps<{
  code: string
  filename?: string
}>()
</script>

<template>
  <div border="~ base" rounded-lg of-auto>
    <pre
      class="p-3 text-xs font-mono leading-relaxed whitespace-pre-wrap break-words"
    ><code>{{ code }}</code></pre>
  </div>
</template>
