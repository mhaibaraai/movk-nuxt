<script setup lang="ts">
const rating = ref(3.5)
</script>

<template>
  <MStarRating v-model="rating" allow-half />
</template>
