<script setup lang="ts">
const productRating = ref(4.5)
</script>

<template>
  <MStarRating :model-value="productRating" readonly />
</template>
