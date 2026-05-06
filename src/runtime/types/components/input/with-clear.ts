import type { ButtonProps, InputEmits, InputProps, InputValue } from '@nuxt/ui'
import type { OmitByKey } from '@movk/core'
import type { ClassNameValue } from '../../shared'

export interface WithClearProps<T extends InputValue = InputValue> extends /** @vue-ignore */ OmitByKey<InputProps<T>, 'modelValue' | 'ui'> {
  buttonProps?: ButtonProps
  ui?: Record<string, ClassNameValue>
}

export type WithClearEmits<T extends InputValue = InputValue> = InputEmits<T> & {
  clear: []
}
