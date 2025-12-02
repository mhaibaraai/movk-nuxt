<script setup lang="ts">
const message = ref('')
</script>

<template>
  <MWithCharacterLimit
    v-model="message"
    leading-icon="i-lucide-message-square"
    :max-length="100"
    placeholder="写下你的想法..."
  />
</template>
