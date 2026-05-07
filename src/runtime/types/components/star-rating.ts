import type { ButtonProps } from '@nuxt/ui'
import type { ClassNameValue } from '../shared'

export interface StarRatingProps {
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
  /**
   * 是否禁用
   * @defaultValue false
   */
  disabled?: boolean
  /**
   * 是否只读
   * @defaultValue false
   */
  readonly?: boolean
  /**
   * 是否显示评分徽章
   * @defaultValue true
   */
  showBadge?: boolean
  /** 自定义星星按钮属性 */
  buttonProps?: Partial<ButtonProps>
  /**
   * 未选中星星的图标
   * @defaultValue 'i-lucide-star'
   */
  emptyIcon?: string
  /**
   * 选中星星的图标
   * @defaultValue 'i-lucide-star'
   */
  filledIcon?: string
  /**
   * 半星图标
   * @defaultValue 'i-lucide-star-half'
   */
  halfIcon?: string
  /**
   * 选中星星的颜色
   * @defaultValue 'warning'
   */
  color?: ButtonProps['color']
  /**
   * 星星大小
   * @defaultValue 'md'
   */
  size?: ButtonProps['size']
  /**
   * 是否允许半星
   * @defaultValue false
   */
  allowHalf?: boolean
  /**
   * 是否允许清除评分
   * @defaultValue false
   */
  clearable?: boolean
  ui?: Record<string, ClassNameValue>
}

export interface StarRatingEmits {
  'update:modelValue': [value: number]
  'change': [value: number]
  'hover': [value: number | null]
}
