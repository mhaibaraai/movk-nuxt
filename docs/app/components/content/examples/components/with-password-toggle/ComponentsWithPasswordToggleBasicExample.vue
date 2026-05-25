<script setup lang="ts">
import type { InputProps } from '@nuxt/ui'

defineProps<{
  size: InputProps['size']
  color: InputProps['color']
  variant: InputProps['variant']
  leadingIcon: InputProps['leadingIcon']
}>()

const password = ref('')
</script>

<template>
  <MWithPasswordToggle
    v-model="password"
    placeholder="输入密码..."
    :size
    :color
    :variant
    :leading-icon
  />
</template>
