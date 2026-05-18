import type {
  ButtonProps,
  FormError,
  FormErrorEvent,
  IconProps,
  InferInput
} from '@nuxt/ui'
import type { z } from 'zod'
import type { Suggest } from '@movk/core'
import type { BaseAutoFormProps } from './base'
import type { DynamicFormSlots } from './slots'
import type { VNode } from 'vue'

export interface SearchFormSlotProps<S extends z.ZodObject> {
  expanded: boolean
  loading: boolean
  state: Partial<InferInput<S>>
  errors: FormError[]
  toggle: () => void
  search: () => void
  reset: () => void
  clear: () => void
}

export interface SearchFormAction extends /** @vue-ignore */ Omit<ButtonProps, 'onClick'> {
  key: Suggest<'search' | 'reset'>
  label?: string
  visible?: boolean | ((ctx: SearchFormSlotProps<z.ZodObject>) => boolean)
  onClick?: (ctx: SearchFormSlotProps<z.ZodObject>) => void
}

export interface SearchFormProps<S extends z.ZodObject> extends BaseAutoFormProps<S> {
  /**
   * 网格列数
   * @defaultValue 3
   */
  cols?: number | {
    sm?: number
    md?: number
    lg?: number
    xl?: number
  }
  /**
   * 可见行数（折叠时显示的行数）
   * @defaultValue 1
   */
  visibleRows?: number
  /**
   * 动作按钮配置；不传时使用默认 [search, reset]；传 [] 则关闭所有内置按钮
   * @defaultValue [{ key: 'search', ... }, { key: 'reset', ... }]
   */
  actions?: SearchFormAction[]
  /** 搜索按钮加载状态（作用于 type==='submit' 或 key==='search' 的按钮） */
  loading?: boolean
  /** 收起按钮属性 */
  collapseButtonProps?: ButtonProps
  /**
   * 展开/收起按钮图标
   * @IconifyIcon
   * @defaultValue 'i-lucide-chevron-down'
   */
  icon?: IconProps['name']
  /**
   * 展开按钮文本
   * @defaultValue '展开'
   */
  expandText?: string
  /**
   * 收起按钮文本
   * @defaultValue '收起'
   */
  collapseText?: string
  /** 受控展开状态；优先级高于 defaultExpanded */
  expanded?: boolean
  /**
   * 默认展开状态
   * @defaultValue false
   */
  defaultExpanded?: boolean
}

export interface SearchFormEmits {
  'reset': []
  'clear': []
  'expand': [expanded: boolean]
  'update:expanded': [expanded: boolean]
  'error': [event: FormErrorEvent]
}

export type SearchFormSlots<S extends z.ZodObject> = {
  header(props: SearchFormSlotProps<S>): VNode[]
  footer(props: SearchFormSlotProps<S>): VNode[]
  actions(props: SearchFormSlotProps<S>): VNode[]
  extraActions(props: SearchFormSlotProps<S>): VNode[]
} & DynamicFormSlots<Partial<InferInput<S>>>
