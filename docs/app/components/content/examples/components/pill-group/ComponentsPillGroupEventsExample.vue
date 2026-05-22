<script setup lang="ts">
import type { PillItem, PillSelectPayload } from '@movk/nuxt'

const items: PillItem[] = [
  { value: 'free', label: '免费版', icon: 'i-lucide-gift' },
  { value: 'pro', label: '专业版', icon: 'i-lucide-zap' },
  { value: 'enterprise', label: '企业版', icon: 'i-lucide-building' }
]
const value = ref<PillItem[]>([items[1]!])
const last = ref<string>('（点击选项查看事件）')

function onSelect(payload: PillSelectPayload<PillItem>) {
  const label = typeof payload.item === 'object' && payload.item
    ? payload.item.label ?? String(payload.item.value)
    : String(payload.item)
  last.value = `select: ${label} → selected=${payload.selected}, index=${payload.index}`
}
</script>

<template>
  <div class="flex flex-col gap-3">
    <MPillGroup
      v-model="value"
      :items="items"
      multiple
      @select="onSelect"
    />
    <p class="text-sm text-muted">
      {{ last }}
    </p>
  </div>
</template>
