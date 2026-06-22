<script setup lang="ts">
import type { TreeItem } from '@movk/nuxt'

const items: TreeItem[] = [
  {
    label: 'app',
    icon: 'i-lucide-folder',
    children: [
      {
        label: 'composables',
        icon: 'i-lucide-folder',
        children: [
          { label: 'useAuth.ts', icon: 'i-vscode-icons-file-type-typescript' },
          { label: 'useUser.ts', icon: 'i-vscode-icons-file-type-typescript' }
        ]
      },
      { label: 'app.vue', icon: 'i-vscode-icons-file-type-vue' }
    ]
  },
  { label: 'nuxt.config.ts', icon: 'i-vscode-icons-file-type-nuxt' }
]
</script>

<template>
  <MTree :items="items" :default-expanded="1" />
</template>
