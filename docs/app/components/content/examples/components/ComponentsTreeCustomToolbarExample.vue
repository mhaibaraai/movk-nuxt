<script setup lang="ts">
import type { TreeItem } from '@movk/nuxt'

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
</script>

<template>
  <MTree v-model="checked" :items="items" toolbar searchable checkable>
    <template #toolbar-leading>
      <UBadge label="部门" color="neutral" variant="subtle" size="sm" />
    </template>
    <template #toolbar-trailing>
      <UBadge :label="`${checked.length} 项`" color="primary" variant="subtle" size="sm" />
    </template>
  </MTree>
</template>
