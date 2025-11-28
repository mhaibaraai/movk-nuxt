<script setup lang="ts">
const color = ref('#3b82f6')

const swatches = [
  '#ef4444', // red
  '#f59e0b', // amber
  '#10b981', // green
  '#3b82f6', // blue
  '#8b5cf6', // violet
  '#ec4899'  // pink
]
</script>

<template>
  <MColorChooser
    v-model="color"
    :swatches="swatches"
  />
</template>
