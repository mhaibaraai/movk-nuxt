<script setup lang="ts">
import type { IconProps } from '@nuxt/ui'

defineProps<{
  text: string
  icon: IconProps['name']
}>()

const isVerified = ref(false)
</script>

<template>
  <MSlideVerify
    v-model="isVerified"
    class="w-sm"
    :text
    :icon
  />
</template>
