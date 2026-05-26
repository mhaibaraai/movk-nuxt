<script setup lang="ts">
const value = ref('#ec4899')

const tailwindPalette = [
  '#ef4444', '#f97316', '#f59e0b', '#eab308',
  '#84cc16', '#22c55e', '#10b981', '#14b8a6',
  '#06b6d4', '#0ea5e9', '#3b82f6', '#6366f1',
  '#8b5cf6', '#a855f7', '#d946ef', '#ec4899'
]
</script>

<template>
  <MColorChooser v-model="value" :swatches="tailwindPalette">
    <template #default="{ open, value: current }">
      <button
        type="button"
        class="size-12 rounded-xl border-2 border-default cursor-pointer hover:scale-105 transition flex items-center justify-center"
        :style="{ backgroundColor: current }"
        :aria-expanded="open"
      >
        <UIcon v-if="!current" name="i-lucide-plus" class="text-muted" />
      </button>
    </template>
  </MColorChooser>
</template>
