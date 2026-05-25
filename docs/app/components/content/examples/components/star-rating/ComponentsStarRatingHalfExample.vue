<script setup lang="ts">
defineProps<{
  allowHalf: string
}>()

const rating = ref(3.5)
</script>

<template>
  <MStarRating v-model="rating" :allow-half="allowHalf === 'true'" />
</template>
