<script setup lang="ts" generic="R extends boolean, M extends boolean, P extends 'click' | 'hover' = 'click'">
import { UPopover, UButton, UCalendar } from '#components'
import type { ButtonProps, PopoverProps, CalendarProps, CalendarEmits, PopoverEmits } from '@nuxt/ui'
import type { DateValue } from '@internationalized/date'
import { computed } from 'vue'
import { useDateFormatter } from '../../composables/useDateFormatter'
import type { DateFormatterOptions } from '../../composables/useDateFormatter'
import type { OmitByKey } from '@movk/core'

type LabelFormat = 'iso' | 'formatted' | 'date' | 'timestamp' | 'unix'
const LABEL_FORMATS: LabelFormat[] = ['iso', 'formatted', 'date', 'timestamp', 'unix']

interface DatePickerProps extends /** @vue-ignore */ OmitByKey<CalendarProps<R, M>, 'modelValue'>, DateFormatterOptions {
  buttonProps?: ButtonProps
  popoverProps?: PopoverProps<P>
  /**
   * 标签格式化器
   * - 函数: 自定义格式化逻辑
   * - 'iso': ISO 8601 格式
   * - 'formatted': 本地化格式
   * - 'date': Date 对象的字符串表示
   * - 'timestamp': 时间戳（毫秒）
   * - 'unix': Unix 时间戳（秒）
   */
  labelFormat?: LabelFormat | ((formatter: ReturnType<typeof useDateFormatter>, modelValue: CalendarProps<R, M>['modelValue']) => string)
  placeholderLabel?: string
}

type DatePickerEmits = PopoverEmits & CalendarEmits<R, M>

const {
  buttonProps,
  popoverProps,
  formatOptions = { dateStyle: 'medium' },
  locale,
  labelFormat = 'formatted',
  placeholderLabel = '选择日期'
} = defineProps<DatePickerProps>()

const emit = defineEmits<DatePickerEmits>()

defineOptions({ inheritAttrs: false })

const modelValue = defineModel<CalendarProps<R, M>['modelValue']>()

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
  if (!range.start || !range.end) return placeholderLabel
  return `${convertSingle(range.start, format)} - ${convertSingle(range.end, format)}`
}

const convertToLabel = (value: CalendarProps<R, M>['modelValue']): string => {
  if (!value) return placeholderLabel

  const format = LABEL_FORMATS.includes(labelFormat as LabelFormat) ? labelFormat as LabelFormat : 'formatted'

  if (Array.isArray(value)) {
    return value.length > 0 ? convertArray(value, format) : placeholderLabel
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
          :label="formattedDate"
          color="neutral"
          variant="subtle"
          icon="i-lucide-calendar"
          class="w-full"
          v-bind="buttonProps"
        />
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
