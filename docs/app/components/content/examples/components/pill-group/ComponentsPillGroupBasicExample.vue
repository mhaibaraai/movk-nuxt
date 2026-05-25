<script setup lang="ts">
import type { ButtonProps } from '@nuxt/ui'

defineProps<{
  color: ButtonProps['color']
  size: ButtonProps['size']
  orientation: 'horizontal' | 'vertical'
}>()

const items = ['全部', '进行中', '已完成', '已归档']
const value = ref<string | undefined>('全部')
</script>

<template>
  <MPillGroup
    v-model="value"
    :items
    :color
    :size
    :orientation
  />
</template>
