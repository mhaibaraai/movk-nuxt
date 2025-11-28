<script setup lang="ts">
import { CalendarDate } from '@internationalized/date'

const dates = shallowRef<CalendarDate[]>([
  new CalendarDate(2025, 11, 1),
  new CalendarDate(2025, 11, 15),
  new CalendarDate(2025, 11, 30)
])
</script>

<template>
  <MDatePicker
    v-model="dates"
    multiple
    :button-props="{
      label: `已选 ${dates.length} 天`,
      class: 'w-full'
    }"
  />
</template>
