<script setup lang="ts">
defineProps<{
  showBadge: string
}>()

const rating = ref(3)
</script>

<template>
  <MStarRating v-model="rating" :show-badge="showBadge === 'true'" />
</template>
