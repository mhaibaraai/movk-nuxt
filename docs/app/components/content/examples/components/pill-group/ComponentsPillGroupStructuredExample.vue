<script setup lang="ts">
import type { ButtonProps } from '@nuxt/ui'
import type { PillItem } from '@movk/nuxt'

defineProps<{
  color: ButtonProps['color']
  size: ButtonProps['size']
}>()

const items: PillItem[] = [
  { value: 'free', label: '免费版', description: '基础功能 / 1 用户', icon: 'i-lucide-gift' },
  { value: 'pro', label: '专业版', description: '团队协作 / 10 用户', icon: 'i-lucide-zap' },
  { value: 'enterprise', label: '企业版', description: '自定义 SLA / 不限', icon: 'i-lucide-building' }
]
const value = ref<PillItem | undefined>(items[0])
</script>

<template>
  <MPillGroup
    v-model="value"
    :items
    :color
    :size
  />
</template>
