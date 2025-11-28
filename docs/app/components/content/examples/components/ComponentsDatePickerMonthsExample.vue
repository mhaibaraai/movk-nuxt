<script setup lang="ts">
import { CalendarDate } from '@internationalized/date'

const date = ref(new CalendarDate(2025, 11, 18))
</script>

<template>
  <MDatePicker
    v-model="date"
    :number-of-months="3"
    :button-props="{ label: '显示 3 个月', class: 'w-full' }"
  />
</template>
