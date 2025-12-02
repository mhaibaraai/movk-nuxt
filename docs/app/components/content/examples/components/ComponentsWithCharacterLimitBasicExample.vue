<script setup lang="ts">
const text = ref('')
</script>

<template>
  <MWithCharacterLimit v-model="text" placeholder="最多输入 50 个字符..." />
</template>
