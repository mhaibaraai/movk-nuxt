<script setup lang="ts">
import type { PillItem } from '@movk/nuxt'

const items: PillItem[] = [
  { value: 'free', label: '免费版', icon: 'i-lucide-gift' },
  { value: 'pro', label: '专业版', icon: 'i-lucide-zap' },
  { value: 'enterprise', label: '企业版', icon: 'i-lucide-building' }
]
const value = ref<PillItem | undefined>(items[1])
</script>

<template>
  <UFormField label="订阅方案" size="xs" error="示例错误态">
    <MPillGroup v-model="value" :items="items" />
  </UFormField>
</template>
