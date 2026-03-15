import type { GraphBase, GraphBaseOptions, TreeNode } from 'nanovis'
import type { ComputedRef, MaybeRef } from 'vue'
import { isDark } from '@rspack-devtools/ui/composables/dark'
import { createColorGetterSpectrum } from 'nanovis'
import { computed, nextTick, onUnmounted, ref, shallowRef, unref, watch } from 'vue'
import { formatBytes } from '@rspack-devtools/ui/utils/format'

export interface ChartGraphOptions<T, I, N> {
  data: ComputedRef<T[]> | MaybeRef<T[]>
  nameKey: string
  sizeKey: string
  rootText?: string
  nodeType?: string
  graphOptions?: GraphBaseOptions<I | undefined>
  onUpdate?: () => void
  tree?: ComputedRef<{
    map: Map<string, N>
    root: N
    maxDepth: number
  }>
}

export function useChartGraph<T extends Record<string, any>, I extends T & Record<string, any>, N extends TreeNode<any>>(options: ChartGraphOptions<T, I, N>) {
  const { data, nameKey, sizeKey, rootText, nodeType, graphOptions, onUpdate } = options
  const nodeHover = shallowRef<N | undefined>(undefined)
  const nodeSelected = shallowRef<N | undefined>(undefined)
  const selectedNode = ref<I | undefined>(undefined)
  const graph = shallowRef<GraphBase<I | undefined, GraphBaseOptions<I | undefined>> | undefined>(undefined)
  let dispose: () => void | undefined

  const tree = computed(() => {
    if (options.tree) {
      return options.tree.value
    }
    const _data = unref(data)
    const map = new Map<string, N>()
    let maxDepth = 0

    const root = {
      id: '~root',
      text: rootText,
      size: 0,
      sizeSelf: 0,
      children: [],
    } as unknown as N

    if (!_data?.length) {
      return { map, root, maxDepth }
    }

    const macrosTasks: (() => void)[] = []

    macrosTasks.unshift(() => {
      root.size += root.children.reduce((acc: number, i: any) => acc + i.size, 0)
      root.subtext = formatBytes(root.size)
      root.children.sort((a: any, b: any) => b.size - a.size || a.id.localeCompare(b.id))
    })

    function dataToNode(item: T, path: string, name: string, parent: N, depth: number): N {
      if (map.has(path)) {
        return map.get(path)!
      }

      if (depth > maxDepth) {
        maxDepth = depth
      }

      const node = {
        id: path,
        text: name,
        size: 0,
        sizeSelf: 0,
        children: [],
        meta: { ...item, path: name, type: 'folder' },
        parent,
      } as unknown as N

      map.set(path, node)
      parent.children.push(node)

      macrosTasks.unshift(() => {
        const selfSize = (node as any).sizeSelf
        ;(node as any).size += node.children.reduce((acc: number, i: any) => acc + i.size, 0)
        ;(node as any).subtext = formatBytes((node as any).size)

        if (node.children.length && selfSize / (node as any).size > 0.1) {
          node.children.push({
            id: `${node.id}-self`,
            text: '',
            size: selfSize,
            sizeSelf: selfSize,
            subtext: formatBytes(selfSize),
            children: [],
            meta: { ...item, path: '', type: nodeType },
            parent: node,
          } as any)
        }

        node.children.sort((a: any, b: any) => b.size - a.size || a.id.localeCompare(b.id))
      })

      return node
    }

    function processData(item: T) {
      const parts: string[] = item[nameKey].split('/').filter(Boolean)
      let current = root
      let currentPath = ''
      let depth = 0

      parts.forEach((part: string, index: number) => {
        currentPath += (currentPath ? '/' : '') + part
        depth++

        if (index === parts.length - 1) {
          const fileNode = {
            id: item[nameKey],
            text: part,
            size: item[sizeKey],
            sizeSelf: item[sizeKey],
            subtext: formatBytes(item[sizeKey]),
            children: [],
            meta: { ...item, path: part, type: nodeType },
          } as unknown as N

          current.children.push(fileNode)
          map.set(item[nameKey], fileNode)
        }
        else {
          current = dataToNode(item, currentPath, part, current, depth)
        }
      })
    }

    _data.forEach(processData)
    macrosTasks.forEach(fn => fn())

    return { map, root, maxDepth }
  })

  const chartOptions = computed<GraphBaseOptions<I | undefined>>(() => {
    return {
      palette: {
        stroke: isDark.value ? '#222' : '#555',
        fg: isDark.value ? '#fff' : '#000',
        bg: isDark.value ? '#111' : '#fff',
      },
      getColor: createColorGetterSpectrum(
        tree.value.root,
        isDark.value ? 0.8 : 0.9,
        isDark.value ? 1 : 1.1,
      ),
      getSubtext: (node: any) => {
        return node.subtext
      },
      ...graphOptions,
    }
  })

  function selectNode(node: N | null, animate?: boolean) {
    selectedNode.value = (node as any)?.meta
    if (!node?.children.length)
      node = (node as any)?.parent as unknown as N | null
    graph.value?.select(node, animate)
  }

  function buildGraph() {
    dispose?.()

    nodeSelected.value = tree.value.root

    onUpdate?.()

    nextTick(() => {
      const selected = selectedNode.value ? tree.value.map.get((selectedNode.value as any)[nameKey]) || null : null
      if (selected)
        selectNode(selected, false)
    })

    dispose = () => {
      graph.value?.dispose()
      graph.value = undefined
      selectedNode.value = undefined
    }
  }

  nextTick(() => {
    watch(
      () => [tree.value, chartOptions.value],
      () => {
        buildGraph()
      },
      { deep: true, immediate: false },
    )

    buildGraph()
  })

  onUnmounted(() => {
    dispose?.()
  })

  return {
    tree,
    graph,
    chartOptions,
    nodeHover,
    nodeSelected,
    selectedNode,
    selectNode,
    buildGraph,
  }
}
