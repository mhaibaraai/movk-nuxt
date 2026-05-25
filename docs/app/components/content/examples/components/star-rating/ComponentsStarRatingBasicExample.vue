<script setup lang="ts">
import type { ButtonProps } from '@nuxt/ui'

defineProps<{
  size: ButtonProps['size']
  color: ButtonProps['color']
  clearable: string
}>()

const rating = ref(3)
</script>

<template>
  <MStarRating
    v-model="rating"
    :size
    :color
    :clearable="clearable === 'true'"
  />
</template>
