import type { ButtonProps, FormInputEvents, FormProps, IconProps, InferInput } from '@nuxt/ui'
import type { z } from 'zod'
import type { OmitByKey } from '@movk/core'
import type { ZodAutoFormFieldMeta } from '../zod'
import type { AutoFormControls } from './controls'
import type { DynamicFormSlots } from './slots'
import type { ClassNameValue } from '../shared'

export interface SearchFormProps<S extends z.ZodObject, T extends boolean = true, N extends boolean = false> extends /** @vue-ignore */ OmitByKey<FormProps<S, T, N>, 'schema' | 'state' | 'validateOn' | 'ui'> {
  schema: S
  state?: N extends false ? Partial<InferInput<S>> : never
  /**
   * 网格列数
   * @defaultValue 3
   */
  cols?: number | { sm?: number, md?: number, lg?: number, xl?: number }
  /**
   * 可见行数（折叠时显示的行数）
   * @defaultValue 1
   */
  visibleRows?: number
  /** 自定义控件映射（复用 AutoForm 的控件系统） */
  controls?: AutoFormControls
  /** 全局字段元数据 */
  globalMeta?: ZodAutoFormFieldMeta
  /** 搜索按钮属性 */
  searchButtonProps?: ButtonProps
  /** 重置按钮属性 */
  resetButtonProps?: ButtonProps
  /** 收起按钮属性 */
  collapseButtonProps?: ButtonProps
  /**
   * 搜索按钮文本
   * @defaultValue '搜索'
   */
  searchText?: string
  /**
   * 重置按钮文本
   * @defaultValue '重置'
   */
  resetText?: string
  /**
   * 是否显示搜索按钮
   * @defaultValue true
   */
  showSearchButton?: boolean
  /**
   * 是否显示重置按钮
   * @defaultValue true
   */
  showResetButton?: boolean
  /**
   * 搜索按钮加载状态
   * @defaultValue false
   */
  loading?: boolean
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
  /**
   * 默认展开状态
   * @defaultValue false
   */
  defaultExpanded?: boolean
  /**
   * 表单验证时机，详见 UForm 的 validateOn 属性
   * @defaultValue []
   */
  validateOn?: FormInputEvents[]
  ui?: Record<string, ClassNameValue>
}

export interface SearchFormEmits<S extends z.ZodObject> {
  search: [value: Partial<InferInput<S>>]
  reset: []
  expand: [expanded: boolean]
}

export type SearchFormSlots<S extends z.ZodObject> = {
  actions(props: {
    expanded: boolean
    toggle: () => void
    search: () => void
    reset: () => void
    loading: boolean
  }): any
  extraActions(props: { expanded: boolean }): any
} & DynamicFormSlots<Partial<InferInput<S>>>
