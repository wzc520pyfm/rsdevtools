<script setup lang="ts">
import type { BuildSession, PackageData } from '../../../../shared/types'
import { computed } from 'vue'

const props = defineProps<{
  packages: PackageData[]
  session: BuildSession | null
}>()

const emit = defineEmits<{
  select: [pkg: PackageData]
}>()

const duplicatePackages = computed(() => props.packages.filter(p => p.isDuplicate))

const groupedDuplicatePackages = computed(() =>
  duplicatePackages.value.reduce((acc, p) => {
    acc[p.name] = [...(acc[p.name] || []), p]
    return acc
  }, {} as Record<string, PackageData[]>))
</script>

<template>
  <template v-if="Object.keys(groupedDuplicatePackages).length">
    <div v-for="(pkgs, name) of groupedDuplicatePackages" :key="name">
      <PackagesTable :packages="pkgs" :session="session" group-view disable-size-sort @select="emit('select', $event)" />
    </div>
  </template>
  <template v-else>
    <div p4>
      <div w-full h-48 flex="~ items-center justify-center" op50 italic>
        No duplicate packages
      </div>
    </div>
  </template>
</template>
