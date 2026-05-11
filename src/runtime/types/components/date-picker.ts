import type { ButtonProps, CalendarEmits, CalendarProps, PopoverEmits, PopoverProps } from '@nuxt/ui'
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
  /**
   * 快捷预设
   * @defaultValue 'default'
   */
  presets?: DatePickerPreset<R, M>[] | 'default'
  ui?: Record<string, ClassNameValue>
}

export type DatePickerEmits<
  R extends boolean,
  M extends boolean,
  V extends ValueFormat = 'date-value'
> = PopoverEmits
  & Omit<CalendarEmits<R, M>, 'update:modelValue'>
  & {
    'update:modelValue': [value: FormattedValue<R, M, V>]
  }
