<script setup lang="ts">
const isVerified1 = ref(false)
const isVerified2 = ref(false)
</script>

<template>
  <div class="space-y-4 w-sm">
    <MSlideVerify
      v-model="isVerified1"
      :height="36"
      :slider-width="40"
      text="小尺寸"
    />
    <MSlideVerify
      v-model="isVerified2"
      :height="56"
      :slider-width="60"
      text="大尺寸"
    />
  </div>
</template>
