<script setup lang="ts">
import type { DateValue, DatePickerExposed } from '@movk/nuxt'

const date = shallowRef<DateValue>()
const open = ref(false)
const picker = useTemplateRef<DatePickerExposed>('picker')
</script>

<template>
  <div class="space-y-3">
    <div class="flex flex-wrap items-center gap-2">
      <UButton label="open()" size="sm" @click="picker?.open()" />
      <UButton label="close()" size="sm" color="neutral" variant="subtle" @click="picker?.close()" />
      <span class="text-sm text-muted">open：{{ open }}</span>
    </div>
    <MDatePicker ref="picker" v-model="date" v-model:open="open" />
  </div>
</template>
