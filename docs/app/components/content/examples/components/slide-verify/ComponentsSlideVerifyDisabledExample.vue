<script setup lang="ts">
defineProps<{
  disabled: string
}>()
</script>

<template>
  <MSlideVerify :disabled="disabled === 'true'" class="w-sm" />
</template>
