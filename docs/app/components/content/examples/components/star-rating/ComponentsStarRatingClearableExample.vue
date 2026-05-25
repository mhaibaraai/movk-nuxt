<script setup lang="ts">
defineProps<{
  clearable: string
}>()

const rating = ref(4)
</script>

<template>
  <MStarRating v-model="rating" :clearable="clearable === 'true'" />
</template>
