<script setup lang="ts">
const email = ref('user@example.com')
</script>

<template>
  <MWithClear
    v-model="email"
    leading-icon="i-lucide-mail"
    placeholder="邮箱地址"
  />
</template>
