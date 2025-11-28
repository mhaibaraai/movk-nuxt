<script setup lang="ts">
const rating = ref(0)
const hovering = ref<number | null>(null)

function handleChange(value: number) {
  console.log('评分已更改:', value)
}

function handleHover(value: number | null) {
  hovering.value = value
}
</script>

<template>
  <div class="space-y-2">
    <MStarRating
      v-model="rating"
      @change="handleChange"
      @hover="handleHover"
    />

    <div class="text-sm text-gray-500">
      <div>当前评分: {{ rating }}</div>
      <div>悬停星级: {{ hovering ?? '-' }}</div>
    </div>
  </div>
</template>
