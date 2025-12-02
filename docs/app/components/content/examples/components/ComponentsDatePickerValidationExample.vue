<script setup lang="ts">
import type { CalendarDate } from '@internationalized/date'

const formatter = useDateFormatter()
const futureDate = shallowRef<CalendarDate>()
const pastDate = shallowRef<CalendarDate>()
</script>

<template>
  <div class="space-y-4">
    <UFormField label="未来日期">
      <MDatePicker
        v-model="futureDate"
        :min-value="formatter.getToday()"
        :button-props="{ label: '选择未来日期', class: 'w-full' }"
      />
    </UFormField>

    <UFormField label="过去日期">
      <MDatePicker
        v-model="pastDate"
        :max-value="formatter.getToday()"
        :button-props="{ label: '选择过去日期', class: 'w-full' }"
      />
    </UFormField>
  </div>
</template>
