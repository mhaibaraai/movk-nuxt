<script lang="ts" setup
  generic="R extends boolean, M extends boolean, P extends 'click' | 'hover', V extends ValueFormat = 'date-value'"
>
import type { ButtonProps, CalendarProps, ComponentConfig } from '@nuxt/ui'
import type { AppConfig } from 'nuxt/schema'
import type { DateValue } from '@internationalized/date'
import { UPopover, UButton, UCalendar, UIcon } from '#components'
import { computed, useAttrs } from 'vue'
import { useAppConfig } from '#imports'
import { useDateFormatter } from '../composables/useDateFormatter'
import type { ValueFormat } from '../composables/useDateFormatter'
import { useExtendedTv } from '../utils/extend-theme'
import theme from '#build/movk-ui/date-picker'
import popoverTheme from '#build/ui/popover'
import type {
  DatePickerEmits,
  DatePickerPreset,
  DatePickerProps,
  FormattedValue,
  LabelFormat
} from '../types/components/date-picker'

interface _Props extends DatePickerProps<R, M, P, V> {
  ui?: ComponentConfig<typeof popoverTheme & typeof theme, AppConfig, 'datePicker'>['slots']
}

const props = withDefaults(defineProps<_Props>(), {
  placeholder: '选择日期',
  labelFormat: 'formatted',
  clearable: false
})

const emits = defineEmits<DatePickerEmits<R, M, V>>()

defineOptions({ inheritAttrs: false })

const attrs = useAttrs()
const modelValue = defineModel<FormattedValue<R, M, V>>()
const appConfig = useAppConfig() as { movk?: { datePicker?: unknown } }

const formatter = useDateFormatter({
  locale: props.locale,
  formatOptions: props.formatOptions,
  timeZone: props.timeZone
})

type CalendarModel = CalendarProps<R, M>['modelValue']
const asModel = (v: unknown) => v as CalendarModel
const isOn = (v: unknown) => v === '' || v === true || v === 'true'

const valueFormat = computed<ValueFormat>(() => props.valueFormat ?? 'date-value')
const isRange = computed(() => isOn(attrs.range))
const isMultiple = computed(() => isOn(attrs.multiple))

const calendarValue = computed<CalendarModel>({
  get: () => formatter.convertFromFormat(modelValue.value, valueFormat.value) as CalendarModel,
  set: (next) => {
    modelValue.value = formatter.convertToFormat(next, valueFormat.value) as FormattedValue<R, M, V>
  }
})

const emptyLabel = computed(() => props.placeholder || props.buttonProps?.label || '')

const fromNumber = (n: number | null): string => n === null ? '' : String(n)

const converters: Record<LabelFormat, (d: DateValue) => string> = {
  iso: formatter.toISO,
  formatted: formatter.format,
  date: d => formatter.toDate(d)?.toLocaleDateString() ?? '',
  timestamp: d => fromNumber(formatter.toTimestamp(d)),
  unix: d => fromNumber(formatter.toUnixTimestamp(d))
}

const formattedDate = computed<string>(() => {
  const value = calendarValue.value
  if (typeof props.labelFormat === 'function') return props.labelFormat(formatter, value)
  if (!value) return emptyLabel.value

  const convert = converters[props.labelFormat as LabelFormat] ?? formatter.format

  if (Array.isArray(value)) {
    return value.length === 0 ? emptyLabel.value : value.map(convert).join(', ')
  }
  if (formatter.isDateRange(value)) {
    if (!value.start || !value.end) return emptyLabel.value
    return `${convert(value.start)} - ${convert(value.end)}`
  }
  return convert(value as DateValue)
})

const hasValue = computed<boolean>(() => {
  const value = calendarValue.value
  if (value === undefined || value === null) return false
  if (Array.isArray(value)) return value.length > 0
  if (formatter.isDateRange(value)) return !!value.start || !!value.end
  return true
})

function handleClear(event: MouseEvent) {
  event.stopPropagation()
  if (isRange.value) calendarValue.value = asModel({ start: undefined, end: undefined })
  else if (isMultiple.value) calendarValue.value = asModel([])
  else calendarValue.value = asModel(undefined)
}

function buildDefaultPresets(): DatePickerPreset<R, M>[] {
  const today = formatter.getToday()
  const range = (start: DateValue, end: DateValue) => asModel({ start, end })

  if (isRange.value) return [
    { label: '今天', value: () => range(today, today) },
    { label: '本周', value: f => range(f.getStartOfWeek(today), f.getEndOfWeek(today)) },
    { label: '本月', value: f => range(f.getStartOfMonth(today), f.getEndOfMonth(today)) },
    { label: '最近 7 天', value: () => range(today.subtract({ days: 6 }), today) },
    { label: '最近 30 天', value: () => range(today.subtract({ days: 29 }), today) }
  ]

  if (isMultiple.value) return []

  return [
    { label: '今天', value: () => asModel(today) },
    { label: '昨天', value: () => asModel(today.subtract({ days: 1 })) },
    { label: '明天', value: () => asModel(today.add({ days: 1 })) }
  ]
}

const resolvedPresets = computed<DatePickerPreset<R, M>[]>(() => {
  if (!props.presets) return []
  if (props.presets === 'default') return buildDefaultPresets()
  return props.presets
})

function applyPreset(preset: DatePickerPreset<R, M>) {
  const value = typeof preset.value === 'function' ? preset.value(formatter) : preset.value
  calendarValue.value = value as CalendarModel
}

const { baseUi, extraUi } = useExtendedTv(
  popoverTheme,
  theme,
  () => appConfig.movk?.datePicker,
  () => ({
    ui: props.ui,
    variants: { withPresets: resolvedPresets.value.length > 0 }
  })
)
</script>

<template>
  <UPopover
    v-bind="popoverProps"
    :ui="baseUi"
    @close:prevent="emits('close:prevent')"
    @update:open="emits('update:open', $event)"
  >
    <template #default="defaultSlotProps">
      <slot v-bind="defaultSlotProps">
        <UButton
          color="neutral"
          variant="subtle"
          icon="i-lucide-calendar"
          :size="(attrs.size as ButtonProps['size'])"
          :label="formattedDate"
          class="w-full"
          v-bind="buttonProps"
        >
          <template v-if="$slots.leading" #leading="leading">
            <slot name="leading" v-bind="leading" />
          </template>
          <template v-if="$slots.trailing" #trailing="trailing">
            <slot name="trailing" v-bind="trailing" />
          </template>
          <template v-else-if="clearable && hasValue" #trailing>
            <UIcon name="i-lucide-x" :class="extraUi.clearIcon" @click="handleClear" />
          </template>
        </UButton>
      </slot>
    </template>

    <template v-if="$slots.anchor" #anchor="anchor">
      <slot name="anchor" v-bind="anchor" />
    </template>

    <template #content>
      <div :class="extraUi.wrapper">
        <div v-if="resolvedPresets.length" :class="extraUi.presets">
          <UButton
            v-for="preset in resolvedPresets"
            :key="preset.label"
            :label="preset.label"
            size="sm"
            color="neutral"
            variant="ghost"
            :class="extraUi.presetButton"
            @click="applyPreset(preset)"
          />
        </div>
        <UCalendar
          v-model="calendarValue"
          :class="extraUi.calendar"
          v-bind="attrs"
          @update:placeholder="e => emits('update:placeholder', e)"
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
      </div>
    </template>
  </UPopover>
</template>
