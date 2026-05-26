<script setup lang="ts">
const value = ref('#14b8a6')

const tailwindPalette = [
  '#ef4444', '#f97316', '#f59e0b', '#eab308',
  '#84cc16', '#22c55e', '#10b981', '#14b8a6',
  '#06b6d4', '#0ea5e9', '#3b82f6', '#6366f1',
  '#8b5cf6', '#a855f7', '#d946ef', '#ec4899'
]
</script>

<template>
  <MColorChooser
    v-model="value"
    :swatches="tailwindPalette"
    :ui="{
      swatches: 'grid grid-cols-4 gap-2',
      swatch: 'size-8 rounded-lg ring-2 ring-default cursor-pointer hover:ring-primary'
    }"
  />
</template>
