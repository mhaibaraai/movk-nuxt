<script setup lang="ts">
import type { DateValue } from '@movk/nuxt'

defineProps<{
  size: 'xs' | 'sm' | 'md' | 'lg' | 'xl'
}>()

const date = shallowRef<DateValue>()
const filterDate = shallowRef<DateValue>()
</script>

<template>
  <div class="space-y-4">
    <UFormField label="预约日期" :size="size" error="请选择预约日期">
      <MDatePicker v-model="date" />
    </UFormField>

    <UFieldGroup :size="size" class="w-full">
      <MDatePicker v-model="filterDate" />
      <UButton icon="i-lucide-search" color="neutral" variant="subtle" />
    </UFieldGroup>
  </div>
</template>
