<script setup lang="ts">
import type { PillItem } from '@movk/nuxt'

const items: PillItem[] = [
  { value: 'free', label: '免费版', icon: 'i-lucide-gift' },
  { value: 'pro', label: '专业版', icon: 'i-lucide-zap' },
  { value: 'enterprise', label: '企业版', icon: 'i-lucide-building' }
]
const value = ref<PillItem[]>([items[1]!])

function getItemLabel(item: PillItem): string {
  if (typeof item === 'object' && item) return item.label ?? String(item.value)
  return String(item)
}
</script>

<template>
  <MPillGroup v-model="value" :items="items" multiple>
    <template #item-label="{ item }">
      <span class="font-semibold">{{ getItemLabel(item) }}</span>
    </template>
    <template #item-trailing="{ selected }">
      <UIcon v-if="selected" name="i-lucide-check" class="size-3.5" />
    </template>
  </MPillGroup>
</template>
