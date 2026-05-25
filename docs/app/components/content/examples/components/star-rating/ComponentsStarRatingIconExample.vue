<script setup lang="ts">
import type { ButtonProps, IconProps } from '@nuxt/ui'

defineProps<{
  filledIcon: IconProps['name']
  emptyIcon: IconProps['name']
  halfIcon: IconProps['name']
  color: ButtonProps['color']
}>()

const rating = ref(3)
</script>

<template>
  <MStarRating
    v-model="rating"
    :filled-icon
    :empty-icon
    :half-icon
    :color
  />
</template>
