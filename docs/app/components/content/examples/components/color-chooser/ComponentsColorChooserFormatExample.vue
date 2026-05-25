<script setup lang="ts">
import type { ColorFormat } from '@movk/nuxt'

defineProps<{
  format: ColorFormat
}>()

const value = ref('#ff6b6b')
</script>

<template>
  <MColorChooser v-model="value" :format />
</template>
