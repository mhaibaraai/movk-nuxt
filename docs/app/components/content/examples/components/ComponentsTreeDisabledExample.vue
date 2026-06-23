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
  },
  {
    label: 'composables',
    icon: 'i-lucide-folder',
    children: [
      { label: 'useAuth.ts', icon: 'i-vscode-icons-file-type-typescript' }
    ]
  }
]

const checked = ref<TreeItem[]>([{ label: 'useAuth.ts' }])
</script>

<template>
  <MTree v-model="checked" :items="items" checkable toolbar disabled />
</template>
