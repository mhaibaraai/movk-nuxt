<script setup lang="ts">
import { CalendarDate } from '@internationalized/date'

const formatter = useDateFormatter()
const futureDate = ref<CalendarDate>()
const pastDate = ref<CalendarDate>()
</script>

<template>
  <div class="space-y-4">
    <!-- 只能选择今天及之后 -->
    <UFormField label="未来日期">
      <MDatePicker
        v-model="futureDate"
        :min-value="formatter.getToday()"
        :button-props="{ label: '选择未来日期', class: 'w-full' }"
      />
    </UFormField>

    <!-- 只能选择过去的日期 -->
    <UFormField label="过去日期">
      <MDatePicker
        v-model="pastDate"
        :max-value="formatter.getToday()"
        :button-props="{ label: '选择过去日期', class: 'w-full' }"
      />
    </UFormField>
  </div>
</template>
