<script setup lang="ts">
defineProps<{
  disabled: string
}>()

const rating = ref(4)
</script>

<template>
  <MStarRating v-model="rating" :disabled="disabled === 'true'" />
</template>
