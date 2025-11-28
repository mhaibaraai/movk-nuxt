<script setup lang="ts">
const searchQuery = ref('')

watch(searchQuery, (value) => {
  console.log('搜索:', value)
})
</script>

<template>
  <MWithClear
    v-model="searchQuery"
    leading-icon="i-lucide-search"
    placeholder="搜索..."
    size="lg"
  />
</template>
