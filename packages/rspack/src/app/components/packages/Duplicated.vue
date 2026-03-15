<script setup lang="ts">
import { formatBytes } from '@rspack-devtools/ui/utils/format'

const props = defineProps<{
  packages: any[]
}>()

const emit = defineEmits<{
  select: [pkg: any]
}>()
</script>

<template>
  <div v-if="!packages.length" py8 text-center op50>
    No duplicate packages found
  </div>
  <div v-else flex="~ col gap-2">
    <div
      v-for="pkg in packages"
      :key="pkg.name"
      border="~ base" rounded-lg p3
      cursor-pointer hover:bg-active
      @click="emit('select', pkg)"
    >
      <div flex="~ gap-3" items-center>
        <span font-mono text-sm>{{ pkg.name }}</span>
        <DisplayBadge text="duplicate" :color="0" />
      </div>
      <div mt1 text-xs op50>
        {{ pkg.instances.length }} instances, {{ formatBytes(pkg.size) }} total
      </div>
      <div mt1 flex="~ gap-2 wrap">
        <DisplayBadge v-for="inst in pkg.instances" :key="inst.path" :text="inst.version" />
      </div>
    </div>
  </div>
</template>
