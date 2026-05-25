<script setup lang="ts">
import type { ButtonProps } from '@nuxt/ui'

defineProps<{
  size: ButtonProps['size']
}>()

const rating = ref(4)
</script>

<template>
  <MStarRating v-model="rating" :size />
</template>
