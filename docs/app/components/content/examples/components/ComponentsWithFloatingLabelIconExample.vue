<script setup lang="ts">
const name = ref('')
</script>

<template>
  <MWithFloatingLabel v-model="name" label="用户名" leading-icon="i-lucide-user" />
</template>
