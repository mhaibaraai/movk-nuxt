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

const selected = ref<TreeItem[]>([])
</script>

<template>
  <div class="space-y-3">
    <MTree v-model="selected" :items="items" multiple />
    <p class="text-sm text-muted">
      已选：{{ selected.map(node => node.label).join('、') || '无' }}
    </p>
  </div>
</template>
