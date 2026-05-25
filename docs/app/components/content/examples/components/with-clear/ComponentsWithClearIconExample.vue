<script setup lang="ts">
import type { InputProps } from '@nuxt/ui'

defineProps<{
  size: InputProps['size']
  leadingIcon: InputProps['leadingIcon']
}>()

const email = ref('user@example.com')
</script>

<template>
  <MWithClear
    v-model="email"
    placeholder="邮箱地址"
    :size
    :leading-icon
  />
</template>
