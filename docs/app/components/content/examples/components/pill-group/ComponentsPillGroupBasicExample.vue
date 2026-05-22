<script setup lang="ts">
const items = ['全部', '进行中', '已完成', '已归档']
const value = ref<string | undefined>('全部')
</script>

<template>
  <MPillGroup v-model="value" :items="items" />
</template>
