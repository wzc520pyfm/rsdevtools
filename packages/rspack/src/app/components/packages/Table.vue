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
  <div border="~ base" rounded-lg of-auto>
    <table w-full text-sm>
      <thead>
        <tr border="b base">
          <th text-left px3 py2 op50 font-medium>Package</th>
          <th text-left px3 py2 op50 font-medium>Version</th>
          <th text-right px3 py2 op50 font-medium>Size</th>
          <th text-right px3 py2 op50 font-medium>Modules</th>
        </tr>
      </thead>
      <tbody>
        <tr
          v-for="pkg in packages"
          :key="pkg.name"
          border="b base last:b-0"
          cursor-pointer hover:bg-active
          @click="emit('select', pkg)"
        >
          <td px3 py2>
            <div flex="~ gap-2" items-center>
              <span font-mono>{{ pkg.name }}</span>
              <DisplayBadge v-if="pkg.isDuplicate" text="dup" :color="0" />
            </div>
          </td>
          <td px3 py2 font-mono op75>{{ pkg.version }}</td>
          <td px3 py2 text-right>
            <DisplayFileSizeBadge :size="pkg.size" />
          </td>
          <td px3 py2 text-right font-mono op75>{{ pkg.moduleCount }}</td>
        </tr>
      </tbody>
    </table>
  </div>
</template>
