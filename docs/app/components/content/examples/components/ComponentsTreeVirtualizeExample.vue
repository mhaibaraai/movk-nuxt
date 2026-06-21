<script setup lang="ts">
import type { TreeItem } from '@movk/nuxt'

const items: TreeItem[] = Array.from({ length: 60 }, (_, group) => ({
  label: `分组 ${group + 1}`,
  defaultExpanded: group === 0,
  children: Array.from({ length: 30 }, (_, leaf) => ({ label: `节点 ${group + 1}-${leaf + 1}` }))
}))
</script>

<template>
  <MTree :items="items" :virtualize="true" class="max-h-72" />
</template>
