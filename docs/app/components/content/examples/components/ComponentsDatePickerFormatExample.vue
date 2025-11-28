<script setup lang="ts">
import { CalendarDate } from '@internationalized/date'

const isoDate = shallowRef(new CalendarDate(2025, 11, 18))
const timestampDate = shallowRef(new CalendarDate(2025, 11, 18))
const customDate = shallowRef(new CalendarDate(2025, 11, 18))
</script>

<template>
  <div class="space-y-4">
    <UFormField label="ISO 格式">
      <MDatePicker v-model="isoDate" label-format="iso" :button-props="{ class: 'w-full' }" />
    </UFormField>

    <UFormField label="时间戳">
      <MDatePicker v-model="timestampDate" label-format="timestamp" :button-props="{ class: 'w-full' }" />
    </UFormField>

    <UFormField label="自定义">
      <MDatePicker
        v-model="customDate"
        :button-props="{ class: 'w-full' }"
        :label-format="(fmt, value) => {
          if (!value || !fmt.isDateValue(value)) return '选择日期'
          return `${fmt.format(value)} (星期${fmt.getDayOfWeek(value)})`
        }"
      />
    </UFormField>
  </div>
</template>
