import type { ModuleDest, ModuleTreeNode } from '../../shared/types'

export { formatBytes, formatDuration, shortenPath, getFileIcon } from '@rspack-devtools/ui/utils/format'

export function toTree(modules: ModuleDest[], name: string) {
  const node: ModuleTreeNode = { name, children: {}, items: [] }

  function add(mod: ModuleDest, parts: string[], current = node) {
    if (!mod)
      return

    if (parts.length <= 1) {
      current.items.push(mod)
      return
    }

    const first = parts.shift()!
    if (!current.children[first])
      current.children[first] = { name: first, children: {}, items: [] }
    add(mod, parts, current.children[first])
  }

  modules.forEach((m) => {
    const parts = m.path.split(/\//g).filter(Boolean)
    add(m, parts)
  })

  function flat(node: ModuleTreeNode) {
    if (!node)
      return
    const children = Object.values(node.children)
    if (children.length === 1 && !node.items.length) {
      const child = children[0]!
      node.name = node.name ? `${node.name}/${child.name}` : child.name
      node.items = child.items
      node.children = child.children
      flat(node)
    }
    else {
      children.forEach(flat)
    }
  }

  Object.values(node.children).forEach(flat)

  return node
}
