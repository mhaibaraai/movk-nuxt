<script setup lang="ts">
import { CalendarDate } from '@internationalized/date'

const date = shallowRef(new CalendarDate(2025, 11, 18))
</script>

<template>
  <MDatePicker v-model="date" />
</template>
