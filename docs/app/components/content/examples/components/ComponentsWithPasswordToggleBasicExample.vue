<script setup lang="ts">
const password = ref('')
</script>

<template>
  <MWithPasswordToggle
    v-model="password"
    placeholder="输入密码..."
  />
</template>
