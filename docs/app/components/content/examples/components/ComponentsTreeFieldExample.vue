<script setup lang="ts">
const items = [
  {
    name: '技术中心',
    nodes: [
      { name: '前端组', nodes: [{ name: '组件库' }, { name: '可视化' }] },
      { name: '后端组' }
    ]
  },
  { name: '产品中心', nodes: [{ name: '交互设计' }] }
]
</script>

<template>
  <MTree :items="items" children-key="nodes" label-key="name" />
</template>
