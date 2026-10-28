<script setup lang="ts">
defineProps<{
  size: 'xs' | 'sm' | 'md' | 'lg' | 'xl'
}>()
</script>

<template>
  <UFieldGroup :size="size">
    <MDatePicker />
    <UButton icon="i-lucide-calendar-check" color="neutral" variant="subtle" />
  </UFieldGroup>
</template>
