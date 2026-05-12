import type { ButtonProps, IconProps } from '@nuxt/ui'
import type { ClassNameValue } from '../shared'
import type {} from '@movk/core'

export interface StarRatingProps {
  id?: string
  name?: string
  /**
   * 当前评分值
   * @defaultValue 0
   */
  modelValue?: number
  /**
   * 最大星级数
   * @defaultValue 5
   */
  max?: number
  /** 是否禁用 */
  disabled?: boolean
  /** Highlight the ring color like a focus state. */
  highlight?: boolean
  /** 是否只读 */
  readonly?: boolean
  /**
   * 是否显示评分徽章
   * @defaultValue true
   */
  showBadge?: boolean
  buttonProps?: ButtonProps
  /**
   * 未选中星星的图标
   * @IconifyIcon
   * @defaultValue 'i-lucide-star'
   */
  emptyIcon?: IconProps['name']
  /**
   * 选中星星的图标
   * @IconifyIcon
   * @defaultValue 'i-lucide-star'
   */
  filledIcon?: IconProps['name']
  /**
   * 半星图标
   * @IconifyIcon
   * @defaultValue 'i-lucide-star-half'
   */
  halfIcon?: IconProps['name']
  /** 选中星星的颜色 */
  color?: ButtonProps['color']
  /**  星星大小 @defaultValue 'md' */
  size?: ButtonProps['size']
  /** 是否允许半星 */
  allowHalf?: boolean
  /** 是否允许清除评分 */
  clearable?: boolean
  ui?: Record<string, ClassNameValue>
}

export interface StarRatingEmits {
  'update:modelValue': [value: number]
  'change': [value: number]
  'hover': [value: number | null]
}
