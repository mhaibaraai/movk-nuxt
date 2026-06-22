<script setup lang="ts">
import type { TreeExposed, TreeItem } from '@movk/nuxt'

const items: TreeItem[] = [
  {
    label: '技术中心',
    defaultExpanded: true,
    children: [
      { label: '前端组', children: [{ label: '组件库' }, { label: '可视化' }] },
      { label: '后端组', children: [{ label: '网关' }, { label: '存储' }] }
    ]
  }
]

const checked = ref<TreeItem[]>([])
const tree = useTemplateRef<TreeExposed>('tree')

const labels = (nodes?: TreeItem[]) => (nodes ?? []).map(node => node.label).join('、') || '无'
</script>

<template>
  <div class="space-y-3">
    <MTree ref="tree" v-model="checked" :items="items" checkable />
    <dl class="text-sm text-muted space-y-1">
      <div>叶子（leaves）：{{ labels(tree?.treeSelection.leaves) }}</div>
      <div>满选父级（parents）：{{ labels(tree?.treeSelection.parents) }}</div>
      <div>半选父级（halfSelected）：{{ labels(tree?.treeSelection.halfSelected) }}</div>
    </dl>
  </div>
</template>
