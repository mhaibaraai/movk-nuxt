<script setup lang="ts">
import type { IconProps } from '@nuxt/ui'

defineProps<{
  text: string
  successText: string
  icon: IconProps['name']
  successIcon: IconProps['name']
}>()

const isVerified = ref(false)
</script>

<template>
  <MSlideVerify
    v-model="isVerified"
    class="w-sm"
    :text
    :success-text
    :icon
    :success-icon
  />
</template>
