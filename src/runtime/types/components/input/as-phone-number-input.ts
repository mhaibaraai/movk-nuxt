import type { InputProps, InputValue } from '@nuxt/ui'
import type { OmitByKey } from '@movk/core'
import type { ClassNameValue } from '../../shared'

export interface AsPhoneNumberInputProps<T extends InputValue = InputValue> extends /** @vue-ignore */ OmitByKey<InputProps<T>, 'type' | 'modelValue' | 'ui'> {
  /**
   * 输入掩码格式，`#` 表示一个数字位。
   * @defaultValue '(###) ###-####'
   */
  mask?: string
  /**
   * 区号前缀
   * @defaultValue '+86'
   * @example '+1'、'+44'
   */
  dialCode?: string
  ui?: Record<string, ClassNameValue>
}
