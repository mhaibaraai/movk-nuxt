import type { VNode } from 'vue'
import type {
  AcceptableValue,
  AvatarProps,
  BadgeProps,
  ButtonProps,
  IconProps
} from '@nuxt/ui'
import type { ClassNameValue } from '../shared'

export interface PillsItem {
  label?: string
  description?: string
  /** @IconifyIcon */
  icon?: IconProps['name']
  avatar?: AvatarProps
  badge?: string | number | BadgeProps
  value: AcceptableValue
  disabled?: boolean
  onSelect?: (e: Event) => void
  class?: ClassNameValue
  [key: string]: any
}

/** 单值 v-model 类型: VK=undefined → T 或 AcceptableValue (字面量 items); VK=keyof T → T[VK] */
export type PillsModelValue<T, VK extends string | undefined>
  = VK extends keyof T ? T[VK] : T | AcceptableValue

/** v-model 类型: M=true → 数组; 否则 → 单值或 undefined */
export type PillGroupModelValue<
  T,
  VK extends string | undefined,
  M extends boolean
> = M extends true
  ? PillsModelValue<T, VK>[]
  : PillsModelValue<T, VK> | undefined

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
  orientation?: 'horizontal' | 'vertical'
  /** @defaultValue 'md' */
  size?: ButtonProps['size']
  /**
   * @defaultValue 'primary'
   */
  color?: ButtonProps['color']
  /**
   * 容器外壳视觉变体
   * @defaultValue 'solid'
   */
  variant?: ButtonProps['variant']
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
  name?: string
  required?: boolean
  id?: string
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
