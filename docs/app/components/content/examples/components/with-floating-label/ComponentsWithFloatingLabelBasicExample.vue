<script setup lang="ts">
const email = ref('')
</script>

<template>
  <MWithFloatingLabel v-model="email" label="邮箱地址" />
</template>
