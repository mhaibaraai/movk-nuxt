<script setup lang="ts">
import type { InputProps } from '@nuxt/ui'

defineProps<{
  size: InputProps['size']
  color: InputProps['color']
  variant: InputProps['variant']
  leadingIcon: InputProps['leadingIcon']
}>()

const email = ref('')
</script>

<template>
  <MWithFloatingLabel
    v-model="email"
    label="邮箱地址"
    :size
    :color
    :variant
    :leading-icon
  />
</template>
