<script setup lang="ts">
import type { InputProps } from '@nuxt/ui'

defineProps<{
  size: InputProps['size']
  color: InputProps['color']
  variant: InputProps['variant']
  leadingIcon: InputProps['leadingIcon']
}>()

const apiKey = ref('sk-1234567890abcdef')
</script>

<template>
  <MWithCopy
    v-model="apiKey"
    placeholder="输入内容..."
    :size
    :color
    :variant
    :leading-icon
  />
</template>
