<script lang="ts">
import type { DateValue } from '@internationalized/date'
import type { DateFormatterOptions } from '../composables/useDateFormatter'
import type { ButtonProps, CalendarEmits, CalendarProps, PopoverEmits, PopoverProps } from '@nuxt/ui'
import type { OmitByKey } from '@movk/core'

type LabelFormat = 'iso' | 'formatted' | 'date' | 'timestamp' | 'unix'
type DateFormatter = ReturnType<typeof import('../composables/useDateFormatter').useDateFormatter>
type PopoverMode = 'click' | 'hover'

export interface DatePickerProps<R extends boolean, M extends boolean, P extends PopoverMode = PopoverMode> extends /** @vue-ignore */ OmitByKey<CalendarProps<R, M>, 'modelValue' | 'placeholder'>, DateFormatterOptions {
  /**
   * 输入框占位文本
   * @defaultValue '选择日期'
   */
  placeholder?: string
  /** 按钮组件属性 */
  buttonProps?: ButtonProps
  /** 弹出层组件属性 */
  popoverProps?: PopoverProps<P>
  /** 按钮上展示文本的格式 */
  labelFormat?: LabelFormat | ((formatter: DateFormatter, modelValue: CalendarProps<R, M>['modelValue']) => string)
}

type DatePickerEmits<R extends boolean, M extends boolean> = PopoverEmits & CalendarEmits<R, M>
</script>

<script lang="ts" setup generic="R extends boolean, M extends boolean, P extends PopoverMode">
import { UPopover, UButton, UCalendar } from '#components'
import { computed, useAttrs } from 'vue'
import { useDateFormatter } from '../composables/useDateFormatter'

const {
  buttonProps,
  popoverProps,
  formatOptions = { dateStyle: 'medium' },
  locale,
  labelFormat = 'formatted',
  placeholder = '选择日期'
} = defineProps<DatePickerProps<R, M, P>>()

const emits = defineEmits<DatePickerEmits<R, M>>()

defineOptions({ inheritAttrs: false })

const LABEL_FORMATS: LabelFormat[] = ['iso', 'formatted', 'date', 'timestamp', 'unix']
const attrs = useAttrs()
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
  if (!range.start || !range.end) return placeholder || buttonProps?.label || ''
  return `${convertSingle(range.start, format)} - ${convertSingle(range.end, format)}`
}

const convertToLabel = (value: CalendarProps<R, M>['modelValue']): string => {
  if (!value) return placeholder || buttonProps?.label || ''

  const format = LABEL_FORMATS.includes(labelFormat as LabelFormat) ? labelFormat as LabelFormat : 'formatted'

  if (Array.isArray(value)) {
    return value.length > 0 ? convertArray(value, format) : placeholder || buttonProps?.label || ''
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
  <UPopover v-bind="popoverProps" @close:prevent="emits('close:prevent')" @update:open="emits('update:open', $event)">
    <template #default="defaultSlotProps">
      <slot v-bind="defaultSlotProps">
        <UButton
          color="neutral"
          variant="subtle"
          icon="i-lucide-calendar"
          class="w-full"
          :size="(attrs.size as ButtonProps['size'])"
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
        @update:placeholder="(e: any) => emits('update:placeholder', e)"
        @update:start-value="emits('update:startValue', $event)"
        @update:valid-model-value="emits('update:validModelValue', $event)"
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
