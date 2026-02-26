<script setup lang="ts">
import type { TreeItem } from '@nuxt/ui'

interface FileTreeItem {
  label: string
  description?: string
  icon?: string
  defaultExpanded?: boolean
  children?: FileTreeItem[]
}

const props = defineProps<{
  items: FileTreeItem[]
}>()

const EXT_ICON_MAP: Record<string, string> = {
  ts: 'i-vscode-icons-file-type-typescript',
  js: 'i-vscode-icons-file-type-js',
  vue: 'i-vscode-icons-file-type-vue',
  json: 'i-vscode-icons-file-type-json',
  yaml: 'i-vscode-icons-file-type-yaml',
  yml: 'i-vscode-icons-file-type-yaml',
  md: 'i-vscode-icons-file-type-markdown',
  css: 'i-vscode-icons-file-type-css',
  html: 'i-vscode-icons-file-type-html'
}

function getFileIcon(label: string): string | undefined {
  const ext = label.split('.').pop()?.toLowerCase()
  return ext ? EXT_ICON_MAP[ext] : undefined
}

function isFolder(item: FileTreeItem): boolean {
  return item.label.endsWith('/') || (item.children != null && item.children.length > 0)
}

function toTreeItems(items: FileTreeItem[]): (TreeItem & { description?: string })[] {
  return items.map((item) => {
    const folder = isFolder(item)
    const icon = item.icon ?? (folder ? undefined : getFileIcon(item.label))
    const treeItem: TreeItem & { description?: string } = {
      label: item.label,
      defaultExpanded: item.defaultExpanded ?? true,
      ...(icon ? { icon } : {}),
      ...(item.description ? { description: item.description } : {})
    }
    if (item.children) {
      treeItem.children = toTreeItems(item.children)
    }
    return treeItem
  })
}

const treeItems = computed(() => toTreeItems(props.items))
</script>

<template>
  <div class="rounded-lg border border-default p-4 flex justify-center">
    <UTree :items="treeItems" size="sm" color="neutral">
      <template #item-label="{ item }">
        <span class="font-mono text-sm">{{ item.label }}</span>
        <span v-if="(item as any).description" class="ml-3 text-xs text-muted">{{ (item as any).description }}</span>
      </template>
    </UTree>
  </div>
</template>
