<script setup lang="ts">
const value = ref('')
</script>

<template>
  <MWithFloatingLabel
    v-model="value"
    label="自定义标签"
    label-class="text-primary"
    :clear-button-props="{ color: 'error', icon: 'i-lucide-x' }"
  />
</template>
