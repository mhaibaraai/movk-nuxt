<script setup lang="ts">
const rating = ref(4)
</script>

<template>
  <div class="space-y-4">
    <MStarRating v-model="rating" size="xs" />
    <MStarRating v-model="rating" size="sm" />
    <MStarRating v-model="rating" size="md" />
    <MStarRating v-model="rating" size="lg" />
  </div>
</template>
