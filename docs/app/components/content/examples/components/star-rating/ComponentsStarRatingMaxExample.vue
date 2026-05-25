<script setup lang="ts">
const props = defineProps<{
  max: string
}>()

const rating = ref(7)
const maxNum = computed(() => Number(props.max))
</script>

<template>
  <MStarRating v-model="rating" :max="maxNum" />
</template>
