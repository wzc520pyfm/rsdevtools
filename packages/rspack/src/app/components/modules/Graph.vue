<script setup lang="ts">
import type { ModuleData } from '../../../../shared/types'
import type { ModuleGraphLink, ModuleGraphNode } from '~/composables/module-graph'
import { computed, nextTick, unref } from 'vue'
import { createModuleGraph } from '~/composables/module-graph'

const props = defineProps<{
  modules: ModuleData[]
}>()

const emit = defineEmits<{
  (e: 'select', module: ModuleData): void
}>()

const modules = computed(() => props.modules)

const modulesById = computed(() => {
  const map = new Map<string, ModuleData>()
  for (const mod of props.modules) {
    map.set(mod.id, mod)
  }
  return map
})

createModuleGraph<ModuleData, undefined>({
  modules,
  spacing: {
    width: 400,
    height: 55,
    linkOffset: 20,
    margin: 800,
    gap: 150,
  },
  generateGraph: (options) => {
    const { isFirstCalculateGraph, scale, spacing, tree, hierarchy, collapsedNodes, container, modulesMap, nodes, links, nodesMap, linksMap, width, height, childToParentMap, focusOn } = options
    const rootModules = computed(() => {
      return modules.value.filter(x => !x.dependents || x.dependents.length === 0)
    })

    return (focusOnFirstRootNode = true) => {
      width.value = window.innerWidth
      height.value = window.innerHeight

      const seen = new Set<ModuleData>()
      const root = hierarchy<ModuleGraphNode<ModuleData, undefined>>(
        { module: { id: '~root' } } as any,
        (parent) => {
          if (parent.module.id === '~root') {
            rootModules.value.forEach((x) => {
              seen.add(x)
              if (isFirstCalculateGraph.value) {
                childToParentMap.set(x.id, '~root')
              }
            })
            return rootModules.value.map(x => ({
              module: x,
              expanded: !collapsedNodes.has(x.id),
              hasChildren: false,
            }))
          }

          if (collapsedNodes.has(parent.module.id)) {
            return []
          }

          const deps = (parent.module.dependencies ?? [])
            .map((depId): ModuleGraphNode<ModuleData, undefined> | undefined => {
              const module = modulesMap.value.get(depId)
              if (!module)
                return undefined
              if (seen.has(module))
                return undefined

              if (childToParentMap.has(module.id) && childToParentMap.get(module.id) !== parent.module.id)
                return undefined

              seen.add(module)

              if (isFirstCalculateGraph.value) {
                childToParentMap.set(module.id, parent.module.id)
              }

              return {
                module,
                expanded: !collapsedNodes.has(module.id),
                hasChildren: false,
              }
            })
            .filter(x => x !== undefined)

          return deps
        },
      )

      if (isFirstCalculateGraph.value) {
        isFirstCalculateGraph.value = false
      }

      const layout = tree<ModuleGraphNode<ModuleData, undefined>>()
        .nodeSize([unref(spacing.height), unref(spacing.width) + unref(spacing.gap)])
      layout(root)

      const _nodes = root.descendants()

      for (const node of _nodes) {
        ;[node.x, node.y] = [node.y! - unref(spacing.width), node.x!]

        if (node.data.module.dependencies) {
          node.data.hasChildren = node.data.module.dependencies
            .filter(depId => childToParentMap.get(depId) === node.data.module.id)
            .length > 0
        }
      }

      const minX = Math.min(..._nodes.map(n => n.x!))
      const minY = Math.min(..._nodes.map(n => n.y!))
      if (minX < unref(spacing.margin)) {
        for (const node of _nodes) {
          node.x! += Math.abs(minX) + unref(spacing.margin)
        }
      }
      if (minY < unref(spacing.margin)) {
        for (const node of _nodes) {
          node.y! += Math.abs(minY) + unref(spacing.margin)
        }
      }

      nodes.value = _nodes
      nodesMap.clear()
      for (const node of _nodes) {
        nodesMap.set(node.data.module.id, node)
      }
      const _links = root.links()
        .filter(x => x.source.data.module.id !== '~root')
        .map((x): ModuleGraphLink<ModuleData, undefined> => {
          return {
            ...x,
            id: `${x.source.data.module.id}|${x.target.data.module.id}`,
          }
        })

      linksMap.clear()
      for (const link of _links) {
        linksMap.set(link.id, link)
      }
      links.value = _links

      nextTick(() => {
        width.value = (container.value!.scrollWidth / scale.value + unref(spacing.margin))
        height.value = (container.value!.scrollHeight / scale.value + unref(spacing.margin))
        const moduleId = rootModules.value?.[0]?.id
        if (focusOnFirstRootNode && moduleId) {
          nextTick(() => {
            focusOn(moduleId, false)
          })
        }
      })
    }
  },
})

function selectModule(id: string) {
  const mod = modulesById.value.get(id)
  if (mod) {
    emit('select', mod)
  }
}
</script>

<template>
  <DisplayModuleGraph
    :modules="modules"
  >
    <template #default="{ node, nodesRefMap }">
      <div
        :ref="(el: any) => nodesRefMap.set(node.data.module.id, el)"
        flex="1" cursor-pointer
        @click="selectModule(node.data.module.id)"
      >
        <DisplayModuleId
          :name="node.data.module.name"
          :short="true"
          flex="1"
        />
      </div>
    </template>
  </DisplayModuleGraph>
</template>
