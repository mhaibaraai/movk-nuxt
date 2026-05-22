<script setup lang="ts">
const content = ref('一些内容')
</script>

<template>
  <MWithClear
    v-model="content"
    :button-props="{
      color: 'error',
      icon: 'i-lucide-x'
    }"
  />
</template>
