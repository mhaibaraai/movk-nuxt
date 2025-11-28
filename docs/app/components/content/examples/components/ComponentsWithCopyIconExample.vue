<script setup lang="ts">
const token = ref('ghp_abcdef1234567890')
</script>

<template>
  <MWithCopy v-model="token" leading-icon="i-lucide-key" placeholder="GitHub Token" />
</template>
