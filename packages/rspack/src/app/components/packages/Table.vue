<script setup lang="ts">
import type { BuildSession, PackageData } from '../../../../shared/types'
import type { ClientSettings } from '~/state/settings'
import { useCycleList } from '@vueuse/core'
import { Tooltip, Menu as VMenu } from 'floating-vue'
import { settings } from '~/state/settings'

withDefaults(defineProps<{
  packages: PackageData[]
  session: BuildSession | null
  disableSizeSort?: boolean
  groupView?: boolean
}>(), {
  disableSizeSort: false,
  groupView: false,
})

const emit = defineEmits<{
  select: [pkg: PackageData]
}>()

const { state: sizeSortType, next } = useCycleList(['', 'desc', 'asc'], {
  initialValue: settings.value.packageSizeSortType,
})

function toggleSizeSortType() {
  next()
  settings.value.packageSizeSortType = sizeSortType.value
}
</script>

<template>
  <div role="table" min-w-max border="~ base rounded-xl">
    <div role="row" class="border-b border-base" flex="~ row">
      <div role="columnheader" rounded-tl-2 flex-none ws-nowrap py1.5 px2 font-600 :class="[groupView ? 'min-w40' : 'min-w80']">
        <template v-if="groupView">
          <div font-mono>
            <DisplayHighlightedPackageName :name="packages?.[0]?.name!" />
          </div>
        </template>
        <template v-else>
          Package
        </template>
      </div>
      <div v-if="!groupView" role="columnheader" flex-none min-w40 ws-nowrap text-left py1.5 px2 font-600>
        Version
      </div>
      <div role="columnheader" rounded-tr-2 flex-none ws-nowrap py1.5 font-600 min-w40 :class="[groupView ? 'px2' : 'pl2']">
        <button flex="~ row gap1 items-center justify-end" w-full relative pr2>
          Size
          <span v-if="!disableSizeSort" w-6 h-6 rounded-full cursor-pointer hover="bg-active" flex="~ items-center justify-center" @click="toggleSizeSortType">
            <i text-xs :class="[sizeSortType !== 'asc' ? 'i-ph-arrow-down-duotone' : 'i-ph-arrow-up-duotone', sizeSortType ? 'op100 text-primary' : 'op50']" />
          </span>
        </button>
      </div>
      <div role="columnheader" rounded-tr-2 flex-none ws-nowrap py1.5 pl20 pr2 font-600 min-w50>
        Importers
      </div>
    </div>

    <DataVirtualList
      v-if="packages.length"
      role="rowgroup"
      :items="packages"
      key-prop="name"
    >
      <template #default="{ item, index }">
        <div
          role="row"
          flex="~ row"
          class="border-base border-b-1 border-dashed"
          :class="[index === packages.length - 1 ? 'border-b-0' : '']"
          cursor-pointer hover:bg-active
          @click="emit('select', item)"
        >
          <Tooltip
            :triggers="['hover']"
            :delay="1200"
            :disabled="item.name.length < 30"
          >
            <div
              v-if="!groupView" role="cell" font-mono flex-none w80 py1.5 px2 ws-nowrap text-sm overflow-hidden
              truncate
            >
              <DisplayHighlightedPackageName :name="item.name" />
            </div>
            <template #popper>
              <span font-mono text-sm>
                {{ item.name }}
              </span>
            </template>
          </Tooltip>
          <div role="cell" flex="~ items-center" text-left flex-none font-mono py1.5 px2 text-sm min-w40 op80 :class="{ 'text-primary': item.isDuplicate }">
            {{ item.version }}
          </div>
          <div role="cell" flex="~ items-center justify-end" flex-none font-mono py1.5 px2 text-sm min-w40 op80>
            <DisplayFileSizeBadge :size="item.size" />
          </div>
          <div role="cell" flex="~ items-center" flex-1 font-mono py1.5 pl20 pr2 text-sm op80>
            <div v-if="item.dependedBy?.length" flex="~ row gap-1" of-hidden>
              <div flex="~ row gap-1" ws-nowrap>
                <DisplayModuleId :name="item.dependedBy[0]!" :session="session" short />
              </div>
              <VMenu v-if="item.dependedBy.length > 1" :delay="{ show: 200, hide: 0 }" flex-none>
                <DisplayBadge :text="`+${item.dependedBy.length}`" :color="100" class="text-xs rounded px1" />
                <template #popper>
                  <div p2 flex="~ col gap-1">
                    <div v-for="dep of item.dependedBy" :key="dep" flex="~ row gap-1 items-center nowrap" w-max>
                      <DisplayModuleId :name="dep" :session="session" ws-nowrap flex-1 disable-tooltip short />
                    </div>
                  </div>
                </template>
              </VMenu>
            </div>
          </div>
        </div>
      </template>
    </DataVirtualList>
    <div v-else>
      <div p4>
        <div w-full h-48 flex="~ items-center justify-center" op50 italic>
          No data
        </div>
      </div>
    </div>
  </div>
</template>
