<script setup lang="ts">
import type { TreeItem } from '@movk/nuxt'

// 文件夹不设 item.icon，方可观察 expandedIcon / collapsedIcon
const items: TreeItem[] = [
  {
    label: 'app',
    defaultExpanded: true,
    children: [
      { label: 'app.vue', icon: 'i-vscode-icons-file-type-vue' },
      { label: 'nuxt.config.ts', icon: 'i-vscode-icons-file-type-nuxt' }
    ]
  },
  {
    label: 'composables',
    children: [
      { label: 'useAuth.ts', icon: 'i-vscode-icons-file-type-typescript' }
    ]
  }
]
</script>

<template>
  <MTree :items="items" expanded-icon="i-lucide-book-open" collapsed-icon="i-lucide-book" />
</template>
