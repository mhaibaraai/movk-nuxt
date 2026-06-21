<script setup lang="ts">
import type { TreeItem } from '@movk/nuxt'

const items: TreeItem[] = [
  {
    label: 'app',
    icon: 'i-lucide-folder',
    children: [
      { label: 'useAuth.ts', icon: 'i-vscode-icons-file-type-typescript' },
      { label: 'useUser.ts', icon: 'i-vscode-icons-file-type-typescript' }
    ]
  },
  {
    label: 'components',
    icon: 'i-lucide-folder',
    children: [
      { label: 'Card.vue', icon: 'i-vscode-icons-file-type-vue' },
      { label: 'Button.vue', icon: 'i-vscode-icons-file-type-vue' }
    ]
  }
]
</script>

<template>
  <MTree :items="items" searchable />
</template>
