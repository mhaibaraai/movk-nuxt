<script setup lang="ts">
import type { InputProps } from '@nuxt/ui'

defineProps<{
  size: InputProps['size']
  leadingIcon: InputProps['leadingIcon']
}>()

const password = ref('')
</script>

<template>
  <MWithPasswordToggle
    v-model="password"
    placeholder="密码"
    :size
    :leading-icon
  />
</template>
