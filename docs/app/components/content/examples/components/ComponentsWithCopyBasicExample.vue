<script setup lang="ts">
const apiKey = ref('sk-1234567890abcdef')
</script>

<template>
  <MWithCopy
    v-model="apiKey"
    placeholder="输入内容..."
  />
</template>
