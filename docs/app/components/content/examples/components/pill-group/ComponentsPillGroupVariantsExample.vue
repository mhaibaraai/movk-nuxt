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
  <div class="flex flex-col gap-3">
    <MPillGroup v-model="value" :items="items" active-variant="solid" inactive-variant="outline" />
    <MPillGroup v-model="value" :items="items" active-variant="subtle" inactive-variant="ghost" />
    <MPillGroup v-model="value" :items="items" active-variant="outline" inactive-variant="link" />
  </div>
</template>
