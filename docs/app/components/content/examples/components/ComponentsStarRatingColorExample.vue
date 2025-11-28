<script setup lang="ts">
const rating = ref(4)
</script>

<template>
  <div class="space-y-4">
    <MStarRating v-model="rating" color="error" />
    <MStarRating v-model="rating" color="success" />
    <MStarRating v-model="rating" color="primary" />
  </div>
</template>
