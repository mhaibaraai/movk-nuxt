<script lang="ts" setup>
import { CalendarDate } from '@internationalized/date'
import type { DateValue } from '@internationalized/date'
import type { DateRange } from 'reka-ui'

const formatter = useDateFormatter()

const singleDate = shallowRef(new CalendarDate(2025, 11, 18))
const dateRange = shallowRef<DateRange>({
  start: new CalendarDate(2025, 11, 1),
  end: new CalendarDate(2025, 11, 30)
})
const multipleDates = shallowRef<CalendarDate[]>([
  new CalendarDate(2025, 11, 1),
  new CalendarDate(2025, 11, 15),
  new CalendarDate(2025, 11, 30)
])
const customDate = shallowRef(new CalendarDate(2025, 11, 18))
const validatedDate = shallowRef<CalendarDate>()
const disabledDate = shallowRef(new CalendarDate(2025, 11, 18))
const isDateUnavailable = (date: DateValue) => formatter.isWeekend(date)

const isoDate = shallowRef(new CalendarDate(2025, 11, 18))
const timestampDate = shallowRef(new CalendarDate(2025, 11, 18))
const customFormatDate = shallowRef(new CalendarDate(2025, 11, 18))
</script>

<template>
  <Navbar />
  <Matrix title="日期选择器组件" description="`MDatePicker` 组件的多种用法，包括单选、范围、多选和禁用等。">
    <div class="grid gap-6 md:grid-cols-2">
      <UFormField label="单个日期">
        <MDatePicker v-model="singleDate" :button-props="{ label: '选择日期', class: 'w-full' }" />
      </UFormField>

      <UFormField label="日期范围">
        <MDatePicker
          v-model="dateRange"
          :button-props="{ label: '选择范围', class: 'w-full' }"
          range
          :number-of-months="2"
        />
      </UFormField>
    </div>

    <div class="grid gap-6 md:grid-cols-2">
      <UFormField label="多个日期">
        <MDatePicker
          v-model="multipleDates"
          :button-props="{ label: `已选 ${multipleDates.length} 个`, class: 'w-full' }"
          multiple
        />
      </UFormField>

      <UFormField label="自定义样式">
        <MDatePicker v-model="customDate" :button-props="{ label: '选择', color: 'success', class: 'w-full' }" />
      </UFormField>
    </div>

    <div class="grid gap-6 md:grid-cols-2">
      <UFormField label="日期限制" hint="只能选择今天及之后的日期">
        <MDatePicker
          v-model="validatedDate"
          :button-props="{ label: '选择未来日期', class: 'w-full' }"
          :min-value="formatter.getToday()"
        />
      </UFormField>

      <UFormField label="禁用周末" hint="仅允许选择工作日">
        <MDatePicker
          v-model="disabledDate"
          :button-props="{ label: '选择工作日', class: 'w-full' }"
          :is-date-unavailable="isDateUnavailable"
        />
      </UFormField>
    </div>

    <div class="grid gap-6 lg:grid-cols-2">
      <UFormField label="显示多个月份" hint="同时显示 3 个月的日历">
        <MDatePicker v-model="singleDate" :button-props="{ label: '显示 3 个月', class: 'w-full' }" :number-of-months="3" />
      </UFormField>

      <UFormField label="格式化方式">
        <div class="space-y-3">
          <UFormField label="ISO 格式" size="sm">
            <MDatePicker
              v-model="isoDate"
              :button-props="{ label: formatter.toISO(isoDate) || 'ISO 格式', class: 'w-full text-xs' }"
              label-format="iso"
            />
          </UFormField>

          <UFormField label="时间戳" size="sm">
            <MDatePicker
              v-model="timestampDate"
              :button-props="{ label: String(formatter.toTimestamp(timestampDate) || 0).slice(0, 10), class: 'w-full text-xs' }"
              label-format="timestamp"
            />
          </UFormField>

          <UFormField label="自定义格式" size="sm">
            <MDatePicker
              v-model="customFormatDate"
              :button-props="{ label: '选择', class: 'w-full' }"
              :label-format="(fmt, value) => {
                if (!value || !fmt.isDateValue(value)) return '选择日期'
                return `${fmt.format(value)} (星期${fmt.getDayOfWeek(value)})`
              }"
            />
          </UFormField>
        </div>
      </UFormField>
    </div>
  </Matrix>
</template>
