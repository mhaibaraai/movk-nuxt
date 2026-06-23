<script setup lang="ts">
import type { TreeItem } from '@movk/nuxt'

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

const cascade = ref<TreeItem[]>([])
const isolated = ref<TreeItem[]>([])
</script>

<template>
  <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
    <div class="space-y-2">
      <p class="text-sm font-medium">
        cascade（默认）
      </p>
      <MTree v-model="cascade" :items="items" checkable />
    </div>
    <div class="space-y-2">
      <p class="text-sm font-medium">
        isolated
      </p>
      <MTree v-model="isolated" :items="items" checkable strategy="isolated" />
    </div>
  </div>
</template>
