<script setup lang="ts">
import type { ButtonProps } from '@nuxt/ui'

defineProps<{
  color: ButtonProps['color']
}>()

const rating = ref(4)
</script>

<template>
  <MStarRating v-model="rating" :color />
</template>
