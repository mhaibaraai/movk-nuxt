<script setup lang="ts">
const rating = ref(4)
</script>

<template>
  <MStarRating v-model="rating" disabled />
</template>
