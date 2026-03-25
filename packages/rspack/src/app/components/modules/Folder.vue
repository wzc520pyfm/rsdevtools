<script setup lang="ts">
import type { BuildSession, ModuleData, ModuleDest } from '../../../../shared/types'
import { computed } from 'vue'
import { toTree } from '../../utils/format'

const props = defineProps<{
  session?: BuildSession | null
  modules: ModuleData[]
}>()

const emit = defineEmits<{
  (e: 'select', module: ModuleData): void
}>()

const moduleMap = computed(() => {
  const map = new Map<string, ModuleData>()
  for (const mod of props.modules) {
    map.set(mod.name, mod)
  }
  return map
})

const moduleTree = computed(() => {
  if (!props.modules.length) {
    return {
      workspace: { children: {}, items: [] },
      nodeModules: { children: {}, items: [] },
      virtual: { children: {}, items: [] },
    }
  }

  const cwd = props.session?.cwd || ''
  const inWorkspace: ModuleDest[] = []
  const inNodeModules: ModuleDest[] = []
  const inVirtual: ModuleDest[] = []

  props.modules.forEach((mod) => {
    const name = mod.name
    if (name.startsWith('virtual:') || name.startsWith('\0')) {
      inVirtual.push({ full: name, path: name })
    }
    else if (name.includes('node_modules')) {
      inNodeModules.push({ full: name, path: name })
    }
    else if (cwd && name.startsWith(cwd)) {
      inWorkspace.push({ full: name, path: name.slice(cwd.length + 1) })
    }
    else {
      inWorkspace.push({ full: name, path: name })
    }
  })

  return {
    workspace: toTree(inWorkspace, 'Project Root'),
    nodeModules: toTree(inNodeModules, 'Node Modules'),
    virtual: toTree(inVirtual, 'Virtual Modules'),
  }
})

function onSelect(dest: ModuleDest) {
  const mod = moduleMap.value.get(dest.full)
  if (mod) {
    emit('select', mod)
  }
}
</script>

<template>
  <div of-auto max-h-screen pt-45 relative>
    <div flex="~ col gap-2" p4>
      <DisplayTreeNode
        v-if="Object.keys(moduleTree.workspace.children).length || moduleTree.workspace.items.length"
        :node="moduleTree.workspace"
        p="l3"
        icon="i-catppuccin:folder-dist icon-catppuccin"
        icon-open="i-catppuccin:folder-dist-open icon-catppuccin"
        @select="onSelect"
      />

      <template v-if="Object.keys(moduleTree.nodeModules.children).length || moduleTree.nodeModules.items.length">
        <div w-full h-1px border="t base" />
        <DisplayTreeNode
          :node="moduleTree.nodeModules"
          p="l3"
          icon="i-catppuccin:folder-node icon-catppuccin"
          icon-open="i-catppuccin:folder-node-open icon-catppuccin"
          :open="false"
          @select="onSelect"
        />
      </template>

      <template v-if="Object.keys(moduleTree.virtual.children).length || moduleTree.virtual.items.length">
        <div w-full h-1px border="t base" />
        <DisplayTreeNode
          :node="moduleTree.virtual"
          p="l3"
          icon="i-catppuccin:folder-components icon-catppuccin"
          icon-open="i-catppuccin:folder-components-open icon-catppuccin"
          :open="false"
          @select="onSelect"
        />
      </template>
    </div>
  </div>
</template>
