<script setup lang="ts">
import type { DateValue } from '@movk/nuxt'

const formatter = useDateFormatter()
const futureDate = shallowRef<DateValue>()
const workday = shallowRef<DateValue>()
</script>

<template>
  <div class="space-y-4">
    <UFormField label="今天及以后">
      <MDatePicker v-model="futureDate" :min-value="formatter.getToday()" />
    </UFormField>

    <UFormField label="仅工作日">
      <MDatePicker v-model="workday" :is-date-unavailable="formatter.isWeekend" />
    </UFormField>
  </div>
</template>
