<script setup lang="ts" generic="R extends boolean, M extends boolean, P extends 'click' | 'hover' = 'click'">
import { UPopover, UButton, UCalendar } from '#components'
import type { DateValue } from '@internationalized/date'
import { computed } from 'vue'
import { useDateFormatter } from '../composables/useDateFormatter'
import type { DatePickerProps, DatePickerEmits, LabelFormat, ValueType } from '../types/components'

const LABEL_FORMATS: LabelFormat[] = ['iso', 'formatted', 'date', 'timestamp', 'unix']

const {
  buttonProps = { label: '选择日期' },
  popoverProps,
  formatOptions = { dateStyle: 'medium' },
  locale,
  labelFormat = 'formatted'
} = defineProps<DatePickerProps<R, M, P>>()

const emit = defineEmits<DatePickerEmits<R, M>>()

defineOptions({ inheritAttrs: false })

const modelValue = defineModel<ValueType<R, M>>()

const formatter = useDateFormatter({ locale, formatOptions })

const formatConverters: Record<LabelFormat, (date: DateValue) => string> = {
  iso: date => formatter.toISO(date),
  timestamp: date => String(formatter.toTimestamp(date)),
  unix: date => String(formatter.toUnixTimestamp(date)),
  date: date => formatter.toDate(date)?.toLocaleDateString() ?? '',
  formatted: date => formatter.format(date)
}

const convertSingle = (date: DateValue, format: LabelFormat) => formatConverters[format](date)

const convertArray = (dates: DateValue[], format: LabelFormat) =>
  dates.map(d => convertSingle(d, format)).join(', ')

const convertRange = (range: { start?: DateValue | null, end?: DateValue | null }, format: LabelFormat) => {
  if (!range.start || !range.end) return buttonProps.label || ''
  return `${convertSingle(range.start, format)} - ${convertSingle(range.end, format)}`
}

const convertToLabel = (value: ValueType<R, M>): string => {
  if (!value) return buttonProps.label || ''

  const format = LABEL_FORMATS.includes(labelFormat as LabelFormat) ? labelFormat as LabelFormat : 'formatted'

  if (Array.isArray(value)) {
    return value.length > 0 ? convertArray(value, format) : buttonProps.label || ''
  }

  if (typeof value === 'object' && 'start' in value && 'end' in value) {
    return convertRange(value, format)
  }

  return convertSingle(value as DateValue, format)
}

const formattedDate = computed<string>(() => {
  if (typeof labelFormat === 'function') return labelFormat(formatter, modelValue.value)
  return convertToLabel(modelValue.value)
})
</script>

<template>
  <UPopover v-bind="popoverProps" @close:prevent="emit('close:prevent')" @update:open="emit('update:open', $event)">
    <template #default="defaultSlotProps">
      <slot v-bind="defaultSlotProps">
        <UButton
          color="neutral"
          variant="subtle"
          icon="i-lucide-calendar"
          class="w-full"
          v-bind="buttonProps"
        >
          {{ formattedDate }}
          <template v-if="$slots.leading" #leading="leading">
            <slot name="leading" v-bind="leading" />
          </template>
          <template v-if="$slots.trailing" #trailing="trailing">
            <slot name="trailing" v-bind="trailing" />
          </template>
        </UButton>
      </slot>
    </template>

    <template v-if="$slots.anchor" #anchor="anchor">
      <slot name="anchor" v-bind="anchor" />
    </template>

    <template #content>
      <UCalendar
        v-model="modelValue"
        class="p-2"
        v-bind="$attrs"
        @update:placeholder="(e: any) => emit('update:placeholder', e)"
        @update:start-value="emit('update:startValue', $event)"
        @update:valid-model-value="emit('update:validModelValue', $event)"
      >
        <template v-if="$slots.day" #day="day">
          <slot name="day" v-bind="day" />
        </template>
        <template v-if="$slots.heading" #heading="heading">
          <slot name="heading" v-bind="heading" />
        </template>
        <template v-if="$slots['week-day']" #week-day="weekDay">
          <slot name="week-day" v-bind="weekDay" />
        </template>
      </UCalendar>
    </template>
  </UPopover>
</template>
