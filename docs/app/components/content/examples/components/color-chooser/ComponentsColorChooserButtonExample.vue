<script setup lang="ts">
import type { ButtonProps } from '@nuxt/ui'

defineProps<{
  color: ButtonProps['color']
  variant: ButtonProps['variant']
}>()

const themeColor = ref('#3b82f6')
</script>

<template>
  <MColorChooser
    v-model="themeColor"
    label="选择主题色"
    class="w-full"
    :color
    :variant
  />
</template>
