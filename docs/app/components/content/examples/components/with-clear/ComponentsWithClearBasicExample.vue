<script setup lang="ts">
const username = ref('张三')
</script>

<template>
  <MWithClear v-model="username" placeholder="输入用户名..." />
</template>
