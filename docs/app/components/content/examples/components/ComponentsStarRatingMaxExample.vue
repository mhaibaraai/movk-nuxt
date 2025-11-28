<script setup lang="ts">
const rating = ref(7)
</script>

<template>
  <MStarRating v-model="rating" :max="10" />
</template>
