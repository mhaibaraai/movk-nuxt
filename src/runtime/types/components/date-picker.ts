import type { ButtonProps, CalendarEmits, CalendarProps, PopoverEmits, PopoverProps } from '@nuxt/ui'
import type { OmitByKey } from '@movk/core'
import type { DateFormatterOptions } from '../../composables/useDateFormatter'

export type LabelFormat = 'iso' | 'formatted' | 'date' | 'timestamp' | 'unix'
type DateFormatter = ReturnType<typeof import('../../composables/useDateFormatter').useDateFormatter>
type PopoverMode = 'click' | 'hover'

export interface DatePickerProps<R extends boolean, M extends boolean, P extends PopoverMode = PopoverMode> extends DateFormatterOptions, /** @vue-ignore */ OmitByKey<CalendarProps<R, M>, 'modelValue' | 'placeholder'> {
  /**
   * 输入框占位文本
   * @defaultValue '选择日期'
   */
  placeholder?: string
  buttonProps?: ButtonProps
  popoverProps?: PopoverProps<P>
  labelFormat?: LabelFormat | ((formatter: DateFormatter, modelValue: CalendarProps<R, M>['modelValue']) => string)
}

export type DatePickerEmits<R extends boolean, M extends boolean> = PopoverEmits & CalendarEmits<R, M>
