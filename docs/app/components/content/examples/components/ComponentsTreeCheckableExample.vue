<script setup lang="ts">
import type { TreeItem } from '@movk/nuxt'

const items: TreeItem[] = [
  {
    label: '技术中心',
    defaultExpanded: true,
    children: [
      { label: '前端组', children: [{ label: '组件库' }, { label: '可视化' }] },
      { label: '后端组' }
    ]
  },
  { label: '产品中心', children: [{ label: '交互设计' }] }
]

const checked = ref<TreeItem[]>([])
</script>

<template>
  <MTree v-model="checked" :items="items" checkable />
</template>
