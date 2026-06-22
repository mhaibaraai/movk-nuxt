<script setup lang="ts">
import type { TreeExposed, TreeItem } from '@movk/nuxt'

const items: TreeItem[] = [
  {
    label: '技术中心',
    children: [
      { label: '前端组', children: [{ label: '组件库' }, { label: '可视化' }] },
      { label: '后端组', children: [{ label: '网关' }, { label: '存储' }] }
    ]
  },
  { label: '产品中心', children: [{ label: '交互设计' }, { label: '用户研究' }] }
]

const checked = ref<TreeItem[]>([])
const tree = useTemplateRef<TreeExposed>('tree')
</script>

<template>
  <div class="space-y-3">
    <div class="flex flex-wrap gap-2">
      <UButton size="xs" label="展开到第 2 层" @click="tree?.expandToDepth(2)" />
      <UButton size="xs" label="收起全部" color="neutral" variant="subtle" @click="tree?.collapseAll()" />
      <UButton size="xs" label="全选" @click="tree?.selectAll()" />
      <UButton size="xs" label="清空" color="neutral" variant="subtle" @click="tree?.clearSelection()" />
    </div>
    <MTree ref="tree" v-model="checked" :items="items" checkable />
  </div>
</template>
