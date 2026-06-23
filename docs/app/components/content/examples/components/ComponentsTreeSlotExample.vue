<script setup lang="ts">
import type { TreeItem } from '@movk/nuxt'

const items: TreeItem[] = [
  {
    label: 'app',
    icon: 'i-lucide-folder',
    defaultExpanded: true,
    children: [
      { label: 'app.vue', icon: 'i-vscode-icons-file-type-vue' },
      { label: 'nuxt.config.ts', icon: 'i-vscode-icons-file-type-nuxt' }
    ]
  }
]
</script>

<template>
  <MTree :items="items">
    <template #item-trailing="{ item }">
      <UBadge v-if="!item.children" label="file" color="neutral" variant="subtle" size="sm" />
    </template>
  </MTree>
</template>
