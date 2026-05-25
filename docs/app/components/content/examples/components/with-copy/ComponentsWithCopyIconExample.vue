<script setup lang="ts">
import type { InputProps } from '@nuxt/ui'

defineProps<{
  size: InputProps['size']
  leadingIcon: InputProps['leadingIcon']
}>()

const token = ref('ghp_abcdef1234567890')
</script>

<template>
  <MWithCopy
    v-model="token"
    placeholder="GitHub Token"
    :size
    :leading-icon
  />
</template>
