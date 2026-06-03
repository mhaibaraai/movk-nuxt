<script setup lang="ts">
import type { DateValue } from '@movk/nuxt'

const value = shallowRef<DateValue>()
</script>

<template>
  <MDatePicker
    v-model="value"
    placeholder="选择日期"
    :presets="[
      { label: '本周一', value: f => f.getStartOfWeek(f.getToday()) as DateValue },
      { label: '本月初', value: f => f.getStartOfMonth(f.getToday()) as DateValue },
      { label: '本年初', value: f => f.getStartOfYear(f.getToday()) as DateValue }
    ]"
  />
</template>
