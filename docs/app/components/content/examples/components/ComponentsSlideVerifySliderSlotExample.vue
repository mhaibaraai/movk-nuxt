<script setup lang="ts">
const isVerified = ref(false)
</script>

<template>
  <MSlideVerify v-model="isVerified" class="w-sm">
    <template #slider="{ verified, progress }">
      <UIcon v-if="verified" name="i-lucide-check" />
      <span v-else class="text-xs font-medium">{{ Math.round(progress * 100) }}%</span>
    </template>
  </MSlideVerify>
</template>
