<script setup lang="ts">
import type { PillItem } from '@movk/nuxt'

const items: PillItem[] = [
  { value: 'a', label: 'Feature A', icon: 'i-lucide-sparkles' },
  { value: 'b', label: 'Feature B（敬请期待）', icon: 'i-lucide-clock', disabled: true },
  { value: 'c', label: 'Feature C', icon: 'i-lucide-rocket' }
]
const partial = ref<PillItem | undefined>(items[0])
const full = ref<PillItem | undefined>(items[0])
</script>

<template>
  <div class="flex flex-col gap-3">
    <MPillGroup v-model="partial" :items="items" />
    <MPillGroup v-model="full" :items="items" disabled />
  </div>
</template>
