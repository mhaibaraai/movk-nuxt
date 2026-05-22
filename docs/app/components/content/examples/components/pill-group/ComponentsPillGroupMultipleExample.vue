<script setup lang="ts">
import type { PillItem } from '@movk/nuxt'

const items: PillItem[] = [
  { value: 'free', label: '免费版', icon: 'i-lucide-gift' },
  { value: 'pro', label: '专业版', icon: 'i-lucide-zap' },
  { value: 'enterprise', label: '企业版', icon: 'i-lucide-building' }
]
const value = ref<string[]>(['free', 'pro'])
</script>

<template>
  <MPillGroup v-model="value" :items="items" multiple value-key="value" />
</template>
