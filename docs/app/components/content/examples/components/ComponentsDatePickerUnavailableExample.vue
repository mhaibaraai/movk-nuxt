<script setup lang="ts">
import { CalendarDate } from '@internationalized/date'
import type { DateValue } from '@internationalized/date'

const formatter = useDateFormatter()
const date = ref(new CalendarDate(2025, 11, 18))

// 禁用周末
const isDateUnavailable = (date: DateValue) => {
  return formatter.isWeekend(date)
}
</script>

<template>
  <MDatePicker
    v-model="date"
    :is-date-unavailable="isDateUnavailable"
    :button-props="{ label: '仅工作日', class: 'w-full' }"
  />
</template>
