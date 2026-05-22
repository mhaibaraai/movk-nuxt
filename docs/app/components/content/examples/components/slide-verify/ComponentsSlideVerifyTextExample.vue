<script setup lang="ts">
const isVerified = ref(false)
</script>

<template>
  <MSlideVerify
    v-model="isVerified"
    text="滑动解锁"
    success-text="解锁成功"
    icon="i-lucide-lock"
    success-icon="i-lucide-unlock"
    class="w-sm"
  />
</template>
