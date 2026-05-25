<script setup lang="ts">
import { CalendarDate } from '@internationalized/date'

const props = defineProps<{
  numberOfMonths: string
}>()

const date = shallowRef(new CalendarDate(2025, 11, 18))
const months = computed(() => Number(props.numberOfMonths))
const buttonProps = computed(() => ({ label: `显示 ${months.value} 个月`, class: 'w-full' }))
</script>

<template>
  <MDatePicker
    v-model="date"
    :number-of-months="months"
    :button-props
  />
</template>
