import type { ButtonProps, PopoverProps, ColorPickerProps, PopoverEmits, CalendarProps, CalendarEmits, InputProps, InputEmits, InputSlots, TooltipProps, InputValue } from '@nuxt/ui'
import type { OmitByKey } from '@movk/core'
import type { ClassNameValue } from 'tailwind-merge'
import type { DateFormatterOptions, useDateFormatter } from '../composables/useDateFormatter'

// ColorChooser
export interface ColorChooserProps<P extends 'click' | 'hover' = 'click'> extends /** @vue-ignore */ ColorPickerProps {
  popoverProps?: PopoverProps<P>
  buttonProps?: ButtonProps
}

export type ColorChooserEmits = PopoverEmits

// DatePicker
export type LabelFormat = 'iso' | 'formatted' | 'date' | 'timestamp' | 'unix'
export type ValueType<R extends boolean, M extends boolean> = CalendarProps<R, M>['modelValue']

export interface DatePickerProps<R extends boolean, M extends boolean, P extends 'click' | 'hover' = 'click'> extends /** @vue-ignore */ OmitByKey<CalendarProps<R, M>, 'modelValue'>, DateFormatterOptions {
  buttonProps?: ButtonProps
  popoverProps?: PopoverProps<P>
  labelFormat?: LabelFormat | ((formatter: ReturnType<typeof useDateFormatter>, modelValue: ValueType<R, M>) => string)
}

export type DatePickerEmits<R extends boolean, M extends boolean> = PopoverEmits & CalendarEmits<R, M>

// Input components
export interface WithCharacterLimitProps<T extends InputValue = InputValue> extends /** @vue-ignore */ OmitByKey<InputProps<T>, 'modelValue'> {
  maxLength?: number
  counterClass?: ClassNameValue
}
export type WithCharacterLimitEmits<T extends InputValue = InputValue> = InputEmits<T>
export type WithCharacterLimitSlots = OmitByKey<InputSlots, 'trailing'>

export interface WithClearProps<T extends InputValue = InputValue> extends /** @vue-ignore */ OmitByKey<InputProps<T>, 'modelValue'> {
  buttonProps?: ButtonProps
}
export type WithClearEmits<T extends InputValue = InputValue> = InputEmits<T> & {
  clear: []
}
export type WithClearSlots = OmitByKey<InputSlots, 'trailing'>

export interface WithCopyProps<T extends InputValue = InputValue> extends /** @vue-ignore */ OmitByKey<InputProps<T>, 'modelValue'> {
  buttonProps?: ButtonProps
  tooltipProps?: TooltipProps
}
export type WithCopyEmits<T extends InputValue = InputValue> = InputEmits<T> & {
  copy: [value: string]
}
export type WithCopySlots = OmitByKey<InputSlots, 'trailing'>

export interface WithPasswordToggleProps<T extends InputValue = InputValue> extends /** @vue-ignore */ OmitByKey<InputProps<T>, 'type' | 'modelValue'> {
  buttonProps?: ButtonProps
}
export type WithPasswordToggleEmits<T extends InputValue = InputValue> = InputEmits<T>
export type WithPasswordToggleSlots = OmitByKey<InputSlots, 'trailing'>
