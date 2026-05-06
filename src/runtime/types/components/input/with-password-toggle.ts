import type { ButtonProps, InputProps, InputValue } from '@nuxt/ui'
import type { OmitByKey } from '@movk/core'
import type { ClassNameValue } from '../../shared'

export interface WithPasswordToggleProps<T extends InputValue = InputValue> extends /** @vue-ignore */ OmitByKey<InputProps<T>, 'type' | 'modelValue' | 'ui'> {
  buttonProps?: ButtonProps
  ui?: Record<string, ClassNameValue>
}
