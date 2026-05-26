<script setup lang="ts">
const items = ['全部', '进行中', '已完成', '已归档']
const value = ref<string | undefined>('全部')
</script>

<template>
  <UFieldGroup size="xs" class="w-full">
    <MPillGroup v-model="value" :items="items" />
    <UButton icon="i-lucide-rotate-ccw" color="neutral" variant="subtle" @click="value = undefined" />
  </UFieldGroup>
</template>
