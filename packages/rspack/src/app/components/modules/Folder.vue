<script setup lang="ts">
const props = defineProps<{
  modules: any[]
}>()

const emit = defineEmits<{
  select: [mod: any]
}>()

interface TreeItem {
  name: string
  path: string
  isDir: boolean
  children: TreeItem[]
  module?: any
  size: number
}

const tree = computed(() => {
  const root: TreeItem = { name: '/', path: '/', isDir: true, children: [], size: 0 }
  for (const mod of props.modules) {
    const parts = mod.name.split('/').filter(Boolean)
    let current = root
    for (let i = 0; i < parts.length; i++) {
      const part = parts[i]
      const isLast = i === parts.length - 1
      let child = current.children.find(c => c.name === part)
      if (!child) {
        child = {
          name: part,
          path: parts.slice(0, i + 1).join('/'),
          isDir: !isLast,
          children: [],
          module: isLast ? mod : undefined,
          size: isLast ? mod.size : 0,
        }
        current.children.push(child)
      }
      if (!isLast) current = child
    }
  }
  return root.children
})

const expanded = ref(new Set<string>())

function toggle(path: string) {
  const next = new Set(expanded.value)
  if (next.has(path)) next.delete(path)
  else next.add(path)
  expanded.value = next
}
</script>

<template>
  <div border="~ base" rounded-lg of-auto max-h-600px>
    <template v-for="item in tree" :key="item.path">
      <DisplayTreeNode
        :label="item.name"
        :icon="item.isDir ? 'i-ph-folder-duotone text-amber' : undefined"
        :has-children="item.isDir && item.children.length > 0"
        :expanded="expanded.has(item.path)"
        @toggle="toggle(item.path)"
        @click="item.module ? emit('select', item.module) : toggle(item.path)"
      />
      <template v-if="expanded.has(item.path)">
        <div v-for="child in item.children" :key="child.path" pl4>
          <DisplayTreeNode
            :label="child.name"
            :icon="child.isDir ? 'i-ph-folder-duotone text-amber' : undefined"
            :depth="1"
            @click="child.module ? emit('select', child.module) : undefined"
          />
        </div>
      </template>
    </template>
  </div>
</template>
