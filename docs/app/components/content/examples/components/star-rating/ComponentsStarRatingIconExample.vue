<script setup lang="ts">
const rating = ref(3)
</script>

<template>
  <MStarRating
    v-model="rating"
    filled-icon="i-lucide-heart"
    empty-icon="i-lucide-heart"
    half-icon="i-lucide-heart"
    color="error"
  />
</template>
