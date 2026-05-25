<script setup lang="ts">
defineProps<{
  readonly: string
}>()

const productRating = ref(4.5)
</script>

<template>
  <MStarRating :model-value="productRating" :readonly="readonly === 'true'" />
</template>
