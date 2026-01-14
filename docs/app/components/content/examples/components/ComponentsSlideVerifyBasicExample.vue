<script setup lang="ts">
const isVerified = ref(false)
</script>

<template>
  <MSlideVerify v-model="isVerified" class="w-sm" />
</template>
