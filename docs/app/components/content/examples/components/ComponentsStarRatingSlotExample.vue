<script setup lang="ts">
const rating = ref(4)
</script>

<template>
  <MStarRating v-model="rating">
    <template #prefix>
      <span class="text-sm text-gray-500 mr-2">评分:</span>
    </template>

    <template #badge="{ label }">
      <span class="text-sm text-primary font-semibold ml-2">
        {{ label }} 分
      </span>
    </template>

    <template #suffix>
      <span class="text-xs text-gray-400 ml-2">(128 评价)</span>
    </template>
  </MStarRating>
</template>
