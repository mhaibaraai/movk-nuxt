<script setup lang="ts">
import type { InputProps } from '@nuxt/ui'

defineProps<{
  size: InputProps['size']
  leadingIcon: InputProps['leadingIcon']
}>()

const name = ref('')
</script>

<template>
  <MWithFloatingLabel
    v-model="name"
    label="用户名"
    :size
    :leading-icon
  />
</template>
