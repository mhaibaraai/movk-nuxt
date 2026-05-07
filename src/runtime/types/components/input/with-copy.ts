import type { ButtonProps, InputEmits, InputProps, InputValue, TooltipProps } from '@nuxt/ui'
import type { OmitByKey } from '@movk/core'
import type { ClassNameValue } from '../../shared'

export interface WithCopyProps<T extends InputValue = InputValue> extends /** @vue-ignore */ OmitByKey<InputProps<T>, 'modelValue' | 'ui'> {
  buttonProps?: ButtonProps
  tooltipProps?: TooltipProps
  ui?: Record<string, ClassNameValue>
}

export type WithCopyEmits<T extends InputValue = InputValue> = InputEmits<T> & {
  copy: [value: string]
}
