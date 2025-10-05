import type { OmitByKey } from '@movk/core'
import type { CollapsibleRootProps } from 'reka-ui'
import type { ClassNameValue } from 'tailwind-merge'
import type { GlobalMeta, z } from 'zod/v4'
import type { ComponentProps, ComponentSlots, IsComponent, NonObjectFieldKeys, ObjectFieldKeys, ReactiveValue, Suggest } from '../core'

type DynamicFieldSlotKeys = 'default' | 'label' | 'description' | 'hint' | 'help' | 'error'
type DynamicFieldNestedSlotKeys = 'content'

export type DynamicFormSlots<T>
  = Record<string, (props: AutoFormFieldContext<T>) => any>
    & Record<`field-${DynamicFieldSlotKeys}`, (props: AutoFormFieldContext<T>) => any>
    & Record<`field-${DynamicFieldSlotKeys}:${NonObjectFieldKeys<T>}`, (props: AutoFormFieldContext<T>) => any>
    & Record<`field-${DynamicFieldSlotKeys}:${ObjectFieldKeys<T>}`, (props: AutoFormFieldCollapsibleContext<T>) => any>
    & Record<`field-${DynamicFieldNestedSlotKeys}:${ObjectFieldKeys<T>}`, (props: AutoFormFieldContext<T>) => any>

export interface AutoFormFieldContext<S = any> {
  /** 表单数据 - 使用 getter 确保获取最新值 */
  readonly state: S
  /** 字段路径 */
  readonly path: string
  /** 字段值 - 使用 getter 确保获取最新值 */
  readonly value: S[keyof S]
  /** 设置字段值 */
  setValue: (value: S[keyof S]) => void
  /** 表单错误列表 */
  readonly errors: any[]
  /** 表单提交加载状态 */
  readonly loading: boolean
}

export type AutoFormFieldCollapsibleContext<S = any> = AutoFormFieldContext<S> & {
  open: boolean
}

/**
 * 控件元数据（统一模型）- 支持响应式
 */
export interface AutoFormControlsMeta<C extends IsComponent = IsComponent> {
  /** 控件类型（注册键名） */
  type?: string
  /** 控件组件（直传组件时使用） */
  component?: C
  /** 控件属性 */
  controlProps?: ReactiveValue<ComponentProps<C>, AutoFormFieldContext>
  /** 控件插槽（调用侧可部分覆盖） */
  controlSlots?: ReactiveValue<Partial<ComponentSlots<C>>, AutoFormFieldContext>
  /** Zod 错误消息 */
  error?: string
}

export interface AutoFormControl<C extends IsComponent = IsComponent> {
  component: C
  controlProps?: ComponentProps<C>
  controlSlots?: Partial<ComponentSlots<C>>
}

export interface AutoFormControls {
  [key: string]: AutoFormControl
}

export type AutoFormMergeMeta = GlobalMeta & AutoFormControlsMeta & { mapped?: AutoFormControl }

export interface AutoFormField {
  /** 字段路径 */
  path: string
  /** 字段原始 schema */
  schema: z.ZodType
  /** 字段元数据 */
  meta: AutoFormMergeMeta
  /** 字段装饰器信息 */
  decorators: {
    isOptional?: boolean
    isReadonly?: boolean
    defaultValue?: any
    description?: string
  }
  /** 子字段（仅对象类型有效） */
  children?: AutoFormField[]
  /** 数组元素模板 */
  arrayElement?: AutoFormField
}

/** 提取对象的“已知键”（剔除 string/number/symbol 索引） */
type KnownKeys<T> = {
  [K in keyof T]-?: string extends K
    ? never
    : number extends K
      ? never
      : symbol extends K
        ? never
        : K
}[keyof T]

type OmitControlMeta<T extends IsComponent> = OmitByKey<AutoFormControlsMeta<T>, 'component' | 'type'>

type MetaByType<TControls, K extends keyof TControls>
  = TControls[K] extends AutoFormControl<infer C>
    ? OmitControlMeta<C>
    : OmitControlMeta<IsComponent>

type MetaByZod<TControls, TZod extends string>
  = TZod extends KnownKeys<TControls>
    ? TControls[TZod] extends AutoFormControl<infer C>
      ? OmitControlMeta<C>
      : OmitControlMeta<IsComponent>
    : OmitControlMeta<IsComponent>

export type AutoFormFactoryMethod<
  TControls,
  TZod extends string,
  TResult,
  TExtraParams extends any[] = [],
> = {
  // 支持直接传入字符串作为错误消息
  (...args: [...TExtraParams, string?]): TResult
} & {
  // 支持传入元数据对象
  (...args: [...TExtraParams, ({ component?: never, type?: never } & MetaByZod<TControls, TZod>)?]): TResult
} & {
  // 支持指定控件类型
  <K extends KnownKeys<TControls> & keyof TControls & string>(
    ...args: [...TExtraParams, ({ type: Suggest<K>, component?: never } & MetaByType<TControls, K>)?]
  ): TResult
} & {
  // 支持直接传入组件
  <C extends IsComponent>(
    ...args: [...TExtraParams, ({ component: C, type?: never } & OmitControlMeta<C>)?]
  ): TResult
}

export interface AutoFormNestedCollapsible extends Pick<CollapsibleRootProps, 'defaultOpen' | 'open' | 'disabled' | 'unmountOnHide'> {
  /**
   * 是否启用折叠功能，当设置为 false 时将直接渲染内容不使用折叠组件
   * @defaultValue true
   */
  enabled?: boolean
  /**
   * The element or component this component should render as.
   * @defaultValue 'div'
   */
  as?: any
  class?: any
  ui?: { root?: ClassNameValue, content?: ClassNameValue }
}
