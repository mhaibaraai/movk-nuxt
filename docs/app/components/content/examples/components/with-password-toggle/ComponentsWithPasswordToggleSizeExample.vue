<script setup lang="ts">
import type { InputProps } from '@nuxt/ui'

defineProps<{
  size: InputProps['size']
  leadingIcon: InputProps['leadingIcon']
}>()

const password = ref('Test@123')
</script>

<template>
  <MWithPasswordToggle
    v-model="password"
    placeholder="请输入密码"
    :size
    :leading-icon
  />
</template>
