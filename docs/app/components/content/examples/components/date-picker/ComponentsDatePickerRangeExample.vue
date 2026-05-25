<script setup lang="ts">
import { CalendarDate } from '@internationalized/date'
import type { DateRange } from '#movk/types'

const props = defineProps<{
  numberOfMonths: string
}>()

const dateRange = shallowRef<DateRange>({
  start: new CalendarDate(2025, 11, 1),
  end: new CalendarDate(2025, 11, 30)
})
const months = computed(() => Number(props.numberOfMonths))
</script>

<template>
  <MDatePicker v-model="dateRange" range :number-of-months="months" />
</template>
