<script setup lang="ts">
import type { SideNavItem } from '../composables/nav'
import { computed } from 'vue'
import { useRouter } from 'vue-router'
import { toggleDark } from '../composables/dark'
import { sideNavItems } from '../composables/nav'

const props = withDefaults(defineProps<{
  items?: SideNavItem[]
  showDarkModeToggle?: boolean
}>(), {
  showDarkModeToggle: true,
})

const router = useRouter()

const items = computed<SideNavItem[]>(() => {
  const navItems = props.items ?? sideNavItems.value
  if (!props.showDarkModeToggle) {
    return navItems
  }
  return [
    ...navItems,
    {
      title: 'Toggle dark mode',
      icon: 'i-ph-sun-duotone dark:i-ph-moon-duotone',
      action: toggleDark,
    },
  ]
})

function handleNav(e: Event, item: SideNavItem) {
  if (item.to) {
    e.preventDefault()
    router.push(item.to)
  }
  item.action?.()
}
</script>

<template>
  <div>
    <div
      border="r y base rounded-r-xl" flex="~ col gap-2" p2 of-y-auto max-h-96vh bg-glass
      class="fixed left-0 top-1/2 -translate-y-1/2 z-50"
    >
      <template v-for="item in items" :key="item.title">
        <component
          :is="item.to ? 'a' : 'button'"
          v-bind="item.to ? { href: item.to } : {}"
          :title="item.title"
          rounded-full
          p2 hover:bg-active op-fade hover:op100
          flex="~ items-center justify-center"
          @click="handleNav($event, item)"
        >
          <div :class="item.icon" text-lg />
        </component>
      </template>
    </div>
  </div>
</template>
