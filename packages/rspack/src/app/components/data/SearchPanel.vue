<script setup lang="ts">
const search = defineModel<string>('search', { default: '' })
</script>

<template>
  <div flex="~ col gap-2">
    <div flex="~ gap-2" items-center>
      <div relative flex-1>
        <div absolute left-2 top="1/2" translate-y="-1/2" i-ph-magnifying-glass op30 />
        <input
          v-model="search"
          type="text"
          placeholder="Search..."
          w-full pl-8 pr-3 py-1.5 rounded border="~ base"
          bg-transparent text-sm outline-none
          focus="border-active"
        >
      </div>
      <slot name="search-end" />
    </div>
    <div v-if="$slots.default" flex="~ gap-2" items-center>
      <slot />
    </div>
  </div>
</template>
