<script setup lang="ts">
import type { FilterMatchRule } from '~/utils/icon'
import { useVModel } from '@vueuse/core'
import { computed } from 'vue'

interface ModelValue { search?: string | false, selected?: string[] | null }

const props = withDefaults(
  defineProps<{
    rules?: FilterMatchRule[]
    modelValue?: ModelValue
    search?: string
    selectedContainerClass?: string
  }>(),
  {
    rules: () => [],
    selectedContainerClass: '',
  },
)

const emit = defineEmits<{
  (e: 'update:modelValue', value: ModelValue): void
  (e: 'update:search', value: string): void
}>()

const isRuleMode = computed(() => props.rules!.length > 0 && props.modelValue !== undefined)
const model = useVModel(props, 'modelValue', emit)
const searchModel = useVModel(props, 'search', emit)

function isRuleSelected(rule: FilterMatchRule) {
  if (!model.value?.selected)
    return true
  return model.value.selected.includes(rule.name)
}

function toggleRule(rule: FilterMatchRule) {
  if (!model.value)
    return
  if (!model.value.selected) {
    model.value.selected = props.rules!.map(r => r.name)
  }
  if (model.value.selected.includes(rule.name)) {
    model.value.selected = model.value.selected.filter(t => t !== rule.name)
  }
  else {
    model.value.selected.push(rule.name)
  }
  if (model.value.selected.length === props.rules!.length) {
    model.value.selected = null
  }
}

function reverseSelect() {
  if (!model.value)
    return
  if (model.value.selected?.length === props.rules!.length) {
    model.value.selected = null
  }
  else if (model.value.selected == null) {
    model.value.selected = []
  }
  else {
    model.value.selected = props.rules!.map(r => r.name).filter(r => !model.value!.selected?.includes(r))
  }
}

function unselectToggle() {
  if (!model.value)
    return
  if (model.value.selected?.length === 0) {
    model.value.selected = null
  }
  else {
    model.value.selected = []
  }
}
</script>

<template>
  <!-- Rule-based mode (v-model + rules) -->
  <div v-if="isRuleMode" flex="col gap-2" max-w-90vw min-w-30vw border="~ base rounded-xl" bg-glass>
    <slot name="search">
      <div v-if="model && model.search !== false" class="flex items-center">
        <input
          v-model="model.search"
          p2 px4
          w-full
          style="outline: none"
          placeholder="Search"
        >
        <slot name="search-end" />
      </div>
    </slot>
    <div v-if="rules!.length" :class="selectedContainerClass" flex="~ gap-2 wrap" p2 border="t base">
      <label
        v-for="rule of rules"
        :key="rule.name"
        border="~ base rounded-md" px2 py1
        flex="~ items-center gap-1"
        select-none
        :title="rule.description"
        :class="isRuleSelected(rule) ? 'bg-active' : 'grayscale op50'"
      >
        <input
          type="checkbox"
          mr1
          :checked="isRuleSelected(rule)"
          @change="toggleRule(rule)"
        >
        <div :class="rule.icon" icon-catppuccin />
        <div text-sm>{{ rule.description || rule.name }}</div>
      </label>
      <button
        rounded-md p1
        flex="~ items-center gap-1"
        select-none
        hover="bg-active"
        title="Reverse Selection"
        @click="reverseSelect"
      >
        <div op75 i-ph-selection-background-duotone />
      </button>
      <button
        rounded-md p1
        flex="~ items-center gap-1"
        select-none
        hover="bg-active"
        :title="model?.selected?.length === 0 ? 'Select All' : 'Unselect All'"
        @click="unselectToggle"
      >
        <div v-if="model?.selected?.length === 0" op75 i-ph-selection-slash-duotone />
        <div v-else op75 i-ph-selection-plus-duotone />
      </button>
    </div>
    <slot />
  </div>

  <!-- Simple search mode (v-model:search) -->
  <div v-else flex="~ col gap-2">
    <div flex="~ gap-2" items-center>
      <div relative flex-1>
        <div absolute left-2 top="1/2" translate-y="-1/2" i-ph-magnifying-glass op30 />
        <input
          v-model="searchModel"
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
