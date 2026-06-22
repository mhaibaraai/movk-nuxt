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

const selectedKeys = ref<string[]>(['app.vue'])
</script>

<template>
  <div class="space-y-3">
    <MTree v-model:selected-keys="selectedKeys" :items="items" checkable />
    <p class="text-sm text-muted">
      selectedKeys：{{ selectedKeys.join('、') || '无' }}
    </p>
  </div>
</template>
