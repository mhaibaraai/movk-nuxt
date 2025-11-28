<script setup lang="ts">
import { CalendarDate } from '@internationalized/date'

const date = shallowRef(new CalendarDate(2025, 11, 18))
</script>

<template>
  <MDatePicker
    v-model="date"
    :button-props="{
      label: '选择生日',
      color: 'primary',
      variant: 'outline',
      icon: 'i-lucide-cake',
      class: 'w-full'
    }"
  />
</template>
