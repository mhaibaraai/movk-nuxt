import type { ButtonProps, ButtonSlots, CalendarEmits, CalendarProps, CalendarSlots, PopoverEmits, PopoverProps, PopoverSlots } from '@nuxt/ui'
import type { OmitByKey } from '@movk/core'
import type { DateValue } from '@internationalized/date'
import type { DateFormatter, DateFormatterOptions, ValueFormat } from '../../composables/useDateFormatter'
import type { ClassNameValue } from '../shared'

export type { ValueFormat } from '../../composables/useDateFormatter'

export type LabelFormat = 'iso' | 'formatted' | 'date' | 'timestamp' | 'unix'

export type DatePickerLabelFormatter<R extends boolean, M extends boolean>
  = (formatter: DateFormatter, modelValue: CalendarProps<R, M>['modelValue']) => string

type PopoverMode = 'click' | 'hover'

type FormattedSingle<V extends ValueFormat>
  = V extends 'date-value' ? DateValue
    : V extends 'iso' ? string
      : V extends 'timestamp' ? number
        : V extends 'unix' ? number
          : V extends 'date' ? Date
            : never

export type FormattedValue<R extends boolean, M extends boolean, V extends ValueFormat>
  = M extends true
    ? FormattedSingle<V>[]
    : R extends true
      ? { start: FormattedSingle<V> | undefined, end: FormattedSingle<V> | undefined } | undefined
      : FormattedSingle<V> | undefined

export interface DatePickerPreset<R extends boolean, M extends boolean> {
  label: string
  value:
    | CalendarProps<R, M>['modelValue']
    | ((formatter: DateFormatter) => CalendarProps<R, M>['modelValue'])
}

export interface DatePickerProps<
  R extends boolean,
  M extends boolean,
  P extends PopoverMode = PopoverMode,
  V extends ValueFormat = 'date-value'
> extends
  DateFormatterOptions,
  /** @vue-ignore */ OmitByKey<CalendarProps<R, M>, 'modelValue' | 'placeholder' | 'ui'> {
  id?: string
  name?: string
  /** @defaultValue '选择日期' */
  placeholder?: string
  buttonProps?: ButtonProps
  popoverProps?: PopoverProps<P>
  labelFormat?: LabelFormat | DatePickerLabelFormatter<R, M>
  /**
   * v-model 投影输出格式
   * @defaultValue 'date-value'
   */
  valueFormat?: V
  clearable?: boolean
  /** 快捷预设 */
  presets?: DatePickerPreset<R, M>[] | 'default'
  ui?: Record<string, ClassNameValue>
}

// reka-ui 未从公共入口导出这些 prop 的类型（Matcher / WeekStartsOn / WeekDayFormat），收窄避免声明发射 TS2883
type CalendarUnportableKeys
  = 'isDateDisabled' | 'isDateUnavailable'
    | 'isMonthDisabled' | 'isMonthUnavailable'
    | 'isYearDisabled' | 'isYearUnavailable'
    | 'weekStartsOn' | 'weekdayFormat'

/** AutoForm calendarDate 控件可移植 props（DatePicker props 去除 reka-ui 不可移植项），用于 controlProps 类型提示 */
export type CalendarDateControlProps = OmitByKey<
  DatePickerProps<boolean, boolean, PopoverMode, ValueFormat>,
  CalendarUnportableKeys
>

export type DatePickerEmits<
  R extends boolean,
  M extends boolean,
  V extends ValueFormat = 'date-value'
> = PopoverEmits
  & Omit<CalendarEmits<R, M>, 'update:modelValue'>
  & {
    'update:modelValue': [value: FormattedValue<R, M, V>]
  }

export type DatePickerSlots<
  P extends PopoverMode = PopoverMode
> = OmitByKey<PopoverSlots<P>, 'anchor'> & CalendarSlots & OmitByKey<ButtonSlots, 'default'>
