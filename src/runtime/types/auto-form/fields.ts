import type { CollapsibleRootProps } from 'reka-ui'
import type { ClassNameValue } from '../shared'
import type { GetFieldValue } from '@movk/core'

type FieldValueType<S, P extends string> = P extends string
  ? (string extends P ? S[keyof S] : GetFieldValue<S, P>)
  : S[keyof S]

type NonUndefinedFieldValue<S, P extends string> = Exclude<FieldValueType<S, P>, undefined>

type RelativePath<T> = T extends readonly any[]
  ? string
  : T extends Record<string, any>
    ? Extract<keyof T, string>
    : string

type _SetValueRelKey<S, P extends string> = RelativePath<NonUndefinedFieldValue<S, P>>

export interface AutoFormFieldContext<S = any, P extends string = string> {
  readonly state: S
  readonly path: P
  readonly value: FieldValueType<S, P>
  /**
   * @example
   * setValue({ name: '张三', email: 'test@example.com' })  // 设置整个对象
   * setValue('name', '张三')  // key 自动推断
   * setValue('[0].title', '新标题')  // 数组索引路径
   */
  setValue: {
    (value: FieldValueType<S, P>): void
    <K extends _SetValueRelKey<S, P>>(
      relativePath: K extends never ? string : K,
      value: any
    ): void
    (relativePath: string, value: any): void
  }
  readonly errors: unknown[]
  readonly loading: boolean
  readonly open?: boolean
  readonly count?: number
}

export interface ResolvedAutoFormFieldContext {
  readonly state: Record<string, any>
  readonly path: string
  readonly value: any
  setValue: (...args: [valueOrUpdater: any] | [path: string, value: any]) => void
  readonly errors: unknown[]
  readonly loading: boolean
  readonly open?: boolean
  readonly count?: number
  readonly extraProps?: Record<string, unknown>
}

export interface AutoFormFieldSlots {
  label: (props: { label?: string } & AutoFormFieldContext) => unknown
  hint: (props: { hint?: string } & AutoFormFieldContext) => unknown
  description: (props: { description?: string } & AutoFormFieldContext) => unknown
  help: (props: { help?: string } & AutoFormFieldContext) => unknown
  error: (props: { error?: boolean | string } & AutoFormFieldContext) => unknown
  default: (props: { error?: boolean | string } & AutoFormFieldContext) => unknown
}

export interface AutoFormNestedCollapsible extends Pick<CollapsibleRootProps, 'defaultOpen' | 'open' | 'disabled' | 'unmountOnHide'> {
  enabled?: boolean
  as?: unknown
  class?: unknown
  ui?: {
    root?: ClassNameValue
    content?: ClassNameValue
  }
}

export interface AutoFormAsyncItems<T = unknown> {
  /** 加载选项；新请求发起时上一个请求的 `signal` 会被 abort，其结果被丢弃 */
  load: (ctx: { state: Record<string, any>, signal: AbortSignal }) => Promise<T[]>
  /** 返回值变化时重新加载；缺省时只在挂载时加载一次 */
  deps?: (state: Record<string, any>) => unknown
  /**
   * 重新加载的防抖时长（ms）
   * @defaultValue 0
   */
  debounce?: number
}
