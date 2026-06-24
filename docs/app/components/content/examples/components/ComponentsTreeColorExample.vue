<script setup lang="ts">
import type { SemanticColor, TreeItem } from '@movk/nuxt'

defineProps<{ color?: SemanticColor }>()

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

const selected = ref<TreeItem>({ label: 'app.vue' })
</script>

<template>
  <MTree v-model="selected" :items="items" :color="color" />
</template>
