<script setup lang="ts">
defineProps<{
  size: 'xs' | 'sm' | 'md' | 'lg' | 'xl'
}>()

const isVerified = ref(false)
</script>

<template>
  <MSlideVerify
    v-model="isVerified"
    class="w-sm"
    :size
  />
</template>
