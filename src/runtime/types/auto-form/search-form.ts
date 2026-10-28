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
import type { SearchQuery } from '../../domains/auto-form/search-query'

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

export interface SearchFormQuerySync<S extends z.ZodObject = z.ZodObject> {
  /**
   * 写入 URL 时使用 `router.replace`，为 `false` 时使用 `router.push`
   * @defaultValue true
   */
  replace?: boolean
  /** 自定义从 URL query 还原搜索状态，缺省时按 schema 字段类型解析 */
  parse?: (query: SearchQuery) => Partial<InferInput<S>>
  /** 自定义把搜索状态写成 URL query，缺省时数组为多值、对象为 JSON */
  serialize?: (state: Partial<InferInput<S>>) => SearchQuery
}

export interface SearchFormProps<S extends z.ZodObject> extends BaseAutoFormProps<S> {
  /**
   * 将搜索条件同步到 URL query：挂载时读取，提交、重置、清空时写入；仅写入 schema 顶层字段，保留其他 query
   * @defaultValue false
   */
  syncQuery?: boolean | SearchFormQuerySync<S>
  /**
   * 提交前清洗载荷：`true` 时去除字符串首尾空白并剔除空值，传函数可自定义；`false` 时原样提交
   * @defaultValue true
   */
  transformPayload?: boolean | ((data: Partial<InferInput<S>>) => Partial<InferInput<S>>)
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
  /** 外部 loading 状态，与提交中状态合并，作用于 type==='submit' 或 key==='search' 的按钮 */
  loading?: boolean
  /** 收起按钮属性 */
  collapseButtonProps?: ButtonProps
  /**
   * 展开/收起按钮图标
   * @IconifyIcon
   * @defaultValue 'i-lucide-chevron-down'
   */
  icon?: IconProps['name']
  /** 展开按钮文本，缺省时取 locale 的 `searchForm.expand` */
  expandText?: string
  /** 收起按钮文本，缺省时取 locale 的 `searchForm.collapse` */
  collapseText?: string
  /**
   * 默认展开状态
   * @defaultValue false
   */
  defaultExpanded?: boolean
}

export interface SearchFormEmits<S extends z.ZodObject = z.ZodObject> {
  reset: [state: Partial<InferInput<S>>]
  clear: [state: Partial<InferInput<S>>]
  expand: [expanded: boolean]
  error: [event: FormErrorEvent]
}

export type SearchFormSlots<S extends z.ZodObject> = {
  header(props: SearchFormSlotProps<S>): VNode[]
  footer(props: SearchFormSlotProps<S>): VNode[]
  actions(props: SearchFormSlotProps<S>): VNode[]
  extraActions(props: SearchFormSlotProps<S>): VNode[]
} & DynamicFormSlots<Partial<InferInput<S>>>
