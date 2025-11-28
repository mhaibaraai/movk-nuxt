<script setup lang="ts">
const comment = ref('')
</script>

<template>
  <MWithCharacterLimit v-model="comment" :max-length="200" placeholder="最多 200 字..." />
</template>
