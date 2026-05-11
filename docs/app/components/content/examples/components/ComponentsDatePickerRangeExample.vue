<script setup lang="ts">
import { CalendarDate } from '@internationalized/date'
import type { DateRange } from '#movk/types'

const dateRange = shallowRef<DateRange>({
  start: new CalendarDate(2025, 11, 1),
  end: new CalendarDate(2025, 11, 30)
})
</script>

<template>
  <MDatePicker v-model="dateRange" range :number-of-months="2" />
</template>
