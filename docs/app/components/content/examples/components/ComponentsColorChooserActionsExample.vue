<script setup lang="ts">
const value = ref('#a855f7')

const tailwindPalette = [
  '#ef4444', '#f97316', '#f59e0b', '#eab308',
  '#84cc16', '#22c55e', '#10b981', '#14b8a6',
  '#06b6d4', '#0ea5e9', '#3b82f6', '#6366f1',
  '#8b5cf6', '#a855f7', '#d946ef', '#ec4899'
]

const toast = useToast()

function handleCopy(v: string) {
  toast.add({ title: '已复制', description: v, color: 'success' })
}

function handleClear() {
  toast.add({ title: '已清除', color: 'neutral' })
}
</script>

<template>
  <MColorChooser
    v-model="value"
    copyable
    clearable
    :swatches="tailwindPalette"
    @copy="handleCopy"
    @clear="handleClear"
  />
</template>
