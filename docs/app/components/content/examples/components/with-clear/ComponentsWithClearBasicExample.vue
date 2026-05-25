<script setup lang="ts">
import type { InputProps } from '@nuxt/ui'

defineProps<{
  size: InputProps['size']
  color: InputProps['color']
  variant: InputProps['variant']
  leadingIcon: InputProps['leadingIcon']
}>()

const username = ref('张三')
</script>

<template>
  <MWithClear
    v-model="username"
    placeholder="输入用户名..."
    :size
    :color
    :variant
    :leading-icon
  />
</template>
