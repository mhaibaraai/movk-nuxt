import type { VNode } from 'vue'
import type { AcceptableValue, BadgeProps, ButtonProps } from '@nuxt/ui'
import type { ClassNameValue } from '../shared'

type PillButtonProps = Omit<
  ButtonProps,
  'to' | 'href' | 'onClick' | 'block' | 'square' | 'activeColor' | 'activeVariant'
>

export interface PillsItem extends PillButtonProps {
  value?: AcceptableValue
  description?: string
  badge?: string | number | BadgeProps
  onSelect?: (e: Event) => void
}

export interface PillGroupProps<
  T extends Record<string, any> = PillsItem,
  VK extends keyof T & string | undefined = undefined
> {
  items?: (AcceptableValue | T)[]
  valueKey?: VK
  /** @defaultValue 'label' */
  labelKey?: keyof T & string
  /** @defaultValue 'description' */
  descriptionKey?: keyof T & string
  /**
   * 对象模式下判定 selected 的比较依据。string 走 `getPath` 比较 (multiple=true 时启用 Map O(1));
   * function 自定义比较;不传则引用相等。
   */
  by?: string | ((a: T, b: T) => boolean)
  /**
   * 排列方向
   * @defaultValue 'horizontal'
   */
  orientation?: string
  /**
   * 按钮尺寸
   * @defaultValue 'md'
   */
  size?: ButtonProps['size']
  /**
   * 按钮颜色
   * @defaultValue 'primary'
   */
  color?: ButtonProps['color']
  /**
   * 选中态单项视觉变体
   * @defaultValue 'solid'
   */
  activeVariant?: ButtonProps['variant']
  /**
   * 未选中态单项视觉变体
   * @defaultValue 'ghost'
   */
  inactiveVariant?: ButtonProps['variant']
  disabled?: boolean
  class?: ClassNameValue
  ui?: Record<string, ClassNameValue>
}

export interface PillGroupEmits {
  'update:modelValue': [value: AcceptableValue | Record<string, any> | (AcceptableValue | Record<string, any>)[] | undefined]
  'change': [value: AcceptableValue | Record<string, any> | (AcceptableValue | Record<string, any>)[] | undefined]
}

export interface PillGroupSlots<T extends Record<string, any> = PillsItem> {
  leading?(props: { item: T | AcceptableValue, index: number, selected: boolean }): VNode[]
  trailing?(props: { item: T | AcceptableValue, index: number, selected: boolean }): VNode[]
  label?(props: { item: T | AcceptableValue, index: number, selected: boolean }): VNode[]
  description?(props: { item: T | AcceptableValue, index: number, selected: boolean }): VNode[]
}
