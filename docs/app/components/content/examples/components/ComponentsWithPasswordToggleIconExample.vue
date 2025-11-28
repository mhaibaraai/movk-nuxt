<script setup lang="ts">
const password = ref('')
</script>

<template>
  <MWithPasswordToggle
    v-model="password"
    leading-icon="i-lucide-lock"
    placeholder="密码"
  />
</template>
