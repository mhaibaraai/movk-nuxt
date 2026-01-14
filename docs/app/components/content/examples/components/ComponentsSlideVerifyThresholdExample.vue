<script setup lang="ts">
const isVerified = ref(false)
</script>

<template>
  <MSlideVerify
    v-model="isVerified"
    :threshold="0.7"
    text="滑动 70% 即可验证"
    class="w-sm"
  />
</template>
