<script setup lang="ts">
import type { PillItem } from '@movk/nuxt'

const items: PillItem[] = [
  { value: 'todo', label: '待办', icon: 'i-lucide-circle', color: 'neutral' },
  { value: 'doing', label: '进行中', icon: 'i-lucide-loader', color: 'warning' },
  { value: 'done', label: '已完成', icon: 'i-lucide-check-circle', color: 'success' },
  { value: 'block', label: '阻塞', icon: 'i-lucide-octagon-x', color: 'error' }
]
const value = ref<PillItem[]>([items[1]!, items[2]!])
</script>

<template>
  <MPillGroup v-model="value" :items="items" multiple :min="1" :max="3" />
</template>
