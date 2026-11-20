<script setup lang="ts">
defineProps<{
  size: 'xs' | 'sm' | 'md' | 'lg' | 'xl'
}>()
</script>

<template>
  <UFormField label="预约日期" :size="size" error="示例错误态">
    <MDatePicker />
  </UFormField>
</template>
