import type { InputProps, InputValue } from '@nuxt/ui'
import type { OmitByKey } from '@movk/core'
import type { ClassNameValue } from '../../shared'

export interface WithCharacterLimitProps<T extends InputValue = InputValue> extends /** @vue-ignore */ OmitByKey<InputProps<T>, 'modelValue' | 'ui'> {
  /**
   * 最大允许输入的字符数
   * @defaultValue 50
   */
  maxLength?: number
  ui?: Record<string, ClassNameValue>
}
