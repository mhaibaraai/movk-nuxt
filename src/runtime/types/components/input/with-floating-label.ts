import type { ButtonProps, InputEmits, InputProps, InputValue } from '@nuxt/ui'
import type { OmitByKey } from '@movk/core'
import type { ClassNameValue } from '../../shared'

export interface WithFloatingLabelProps<T extends InputValue = InputValue> extends /** @vue-ignore */ OmitByKey<InputProps<T>, 'modelValue' | 'size' | 'ui'> {
  label?: string
  size?: InputProps<T>['size']
  clearButtonProps?: ButtonProps
  ui?: Record<string, ClassNameValue>
}

export type WithFloatingLabelEmits<T extends InputValue = InputValue> = InputEmits<T> & {
  clear: []
}
