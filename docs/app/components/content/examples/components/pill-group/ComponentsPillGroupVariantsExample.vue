<script setup lang="ts">
import type { ButtonProps } from '@nuxt/ui'
import type { PillItem } from '@movk/nuxt'

defineProps<{
  activeVariant: ButtonProps['variant']
  inactiveVariant: ButtonProps['variant']
}>()

const items: PillItem[] = [
  { value: 'free', label: '免费版', icon: 'i-lucide-gift' },
  { value: 'pro', label: '专业版', icon: 'i-lucide-zap' },
  { value: 'enterprise', label: '企业版', icon: 'i-lucide-building' }
]
const value = ref<PillItem | undefined>(items[1])
</script>

<template>
  <MPillGroup
    v-model="value"
    :items
    :active-variant
    :inactive-variant
  />
</template>
