<script setup lang="ts">
const props = defineProps<{ assets: any[] }>()
const emit = defineEmits<{ select: [asset: any] }>()

interface TreeItem {
  name: string
  path: string
  children: TreeItem[]
  isDir: boolean
  asset?: any
}

const tree = computed(() => {
  const root: TreeItem = { name: '/', path: '/', children: [], isDir: true }
  for (const asset of props.assets) {
    const parts = asset.name.split('/')
    let current = root
    for (let i = 0; i < parts.length; i++) {
      const part = parts[i]
      const isLast = i === parts.length - 1
      const path = parts.slice(0, i + 1).join('/')
      let child = current.children.find((c: TreeItem) => c.name === part)
      if (!child) {
        child = { name: part, path, children: [], isDir: !isLast, asset: isLast ? asset : undefined }
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
  <div border="~ base" rounded-lg>
    <template v-for="item in tree" :key="item.path">
      <DisplayTreeNode
        :label="item.name"
        :icon="item.isDir ? 'i-ph-folder-duotone text-amber' : undefined"
        :has-children="item.isDir && item.children.length > 0"
        :expanded="expanded.has(item.path)"
        @toggle="toggle(item.path)"
        @click="item.asset ? emit('select', item.asset) : toggle(item.path)"
      />
      <template v-if="expanded.has(item.path) && item.children.length">
        <div v-for="child in item.children" :key="child.path" pl4>
          <DisplayTreeNode
            :label="child.name"
            :icon="child.isDir ? 'i-ph-folder-duotone text-amber' : undefined"
            :depth="1"
            :has-children="child.isDir && child.children.length > 0"
            :expanded="expanded.has(child.path)"
            @toggle="toggle(child.path)"
            @click="child.asset ? emit('select', child.asset) : toggle(child.path)"
          />
          <template v-if="expanded.has(child.path) && child.children.length">
            <div v-for="grandchild in child.children" :key="grandchild.path" pl8>
              <DisplayTreeNode
                :label="grandchild.name"
                :icon="grandchild.isDir ? 'i-ph-folder-duotone text-amber' : undefined"
                :depth="2"
                @click="grandchild.asset ? emit('select', grandchild.asset) : undefined"
              />
            </div>
          </template>
        </div>
      </template>
    </template>
  </div>
</template>
