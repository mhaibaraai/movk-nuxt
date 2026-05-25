<script setup lang="ts">
import type { ButtonProps } from '@nuxt/ui'
import type { ColorFormat } from '@movk/nuxt'

defineProps<{
  format: ColorFormat
  color: ButtonProps['color']
  variant: ButtonProps['variant']
}>()

const value = ref('#3b82f6')
</script>

<template>
  <MColorChooser
    v-model="value"
    :format
    :color
    :variant
  />
</template>
