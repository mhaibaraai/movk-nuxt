<script setup lang="ts">
import type { TreeItem } from '@movk/nuxt'

const items: TreeItem[] = [
  { label: '区域 A' },
  { label: '区域 B' },
  { label: '直辖节点', isLeaf: true }
]

let seq = 0
function loadChildren(node: TreeItem): Promise<TreeItem[]> {
  return new Promise(resolve => setTimeout(() => {
    seq += 1
    resolve([
      { label: `${node.label} / 子节点 ${seq}-1` },
      { label: `${node.label} / 子节点 ${seq}-2`, isLeaf: true }
    ])
  }, 800))
}
</script>

<template>
  <MTree :items="items" lazy :load-children="loadChildren" />
</template>
