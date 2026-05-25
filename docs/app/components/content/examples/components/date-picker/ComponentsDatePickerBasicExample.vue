<script setup lang="ts">
import { CalendarDate } from '@internationalized/date'

const props = defineProps<{
  numberOfMonths: string
}>()

const date = shallowRef(new CalendarDate(2025, 11, 18))
const months = computed(() => Number(props.numberOfMonths))
</script>

<template>
  <MDatePicker v-model="date" :number-of-months="months" />
</template>
