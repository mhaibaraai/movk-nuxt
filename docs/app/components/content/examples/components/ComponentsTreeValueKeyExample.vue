<script setup lang="ts">
const items = [
  { id: 'tech', label: '技术中心', children: [{ id: 'tech-design', label: '设计组' }] },
  { id: 'product', label: '产品中心', children: [{ id: 'product-design', label: '设计组' }] }
]
const selectedKeys = ref(['tech-design'])
const expanded = ref(['tech', 'product'])
</script>

<template>
  <div class="space-y-3">
    <MTree
      v-model:expanded="expanded"
      v-model:selected-keys="selectedKeys"
      :items="items"
      value-key="id"
      checkable
      strategy="isolated"
    />
    <div class="text-sm text-muted space-y-1">
      <div>expanded: {{ expanded }}</div>
      <div>selectedKeys: {{ selectedKeys }}</div>
    </div>
  </div>
</template>
