import type { OmitByKey } from '@movk/core'
import type { CollapsibleRootProps } from 'reka-ui'
import type { ClassNameValue } from 'tailwind-merge'
import type { GlobalMeta, z } from 'zod/v4'
import type { ArrayFieldKeys, ComponentProps, ComponentSlots, IsComponent, NonObjectFieldKeys, ObjectFieldKeys, ReactiveValue, Suggest } from '../core'
import type { FormError } from '@nuxt/ui'
import type { AUTOFORM_META } from '../constants/auto-form'
import type { CalendarDate } from '@internationalized/date'

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
  /** 折叠状态（适用于嵌套字段和数组字段） */
  readonly open?: boolean
  readonly count?: number
}
export interface AutoFormFieldSlots {
  label: (props: { label?: string } & AutoFormFieldContext) => any
  hint: (props: { hint?: string } & AutoFormFieldContext) => any
  description: (props: { description?: string } & AutoFormFieldContext) => any
  help: (props: { help?: string } & AutoFormFieldContext) => any
  error: (props: { error?: boolean | string } & AutoFormFieldContext) => any
  default: (props: { error?: boolean | string } & AutoFormFieldContext) => any
}

type DynamicFieldSlotKeys = keyof AutoFormFieldSlots
type DynamicFieldNestedSlotKeys = 'content'

export type DynamicFormSlots<T>
  = Record<string, (props: AutoFormFieldContext<T>) => any>
    & Record<`field-${DynamicFieldSlotKeys}`, (props: AutoFormFieldContext<T>) => any>
    & Record<`field-${DynamicFieldSlotKeys}:${NonObjectFieldKeys<T>}`, (props: AutoFormFieldContext<T>) => any>
    & Record<`field-${DynamicFieldSlotKeys}:${ObjectFieldKeys<T>}`, (props: AutoFormFieldContext<T>) => any>
    & Record<`field-${DynamicFieldNestedSlotKeys}:${ObjectFieldKeys<T>}`, (props: AutoFormFieldContext<T>) => any>
    & Record<`field-${DynamicFieldNestedSlotKeys}:${ArrayFieldKeys<T>}`, (props: AutoFormFieldContext<T>) => any>

export interface AutoFormSlotProps<T extends object> {
  errors: FormError[]
  loading: boolean
  fields: AutoFormField[]
  state: T
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
  controlSlots?: ReactiveValue<Partial<ComponentSlots<C>>, AutoFormFieldContext> | Record<string, any>
  /** Zod 错误消息 */
  error?: string
}

export interface AutoFormControl<C extends IsComponent = IsComponent> {
  component: C
  controlProps?: ComponentProps<C>
  controlSlots?: Partial<ComponentSlots<C>>
}

export type AutoFormControls = Record<string, AutoFormControl>

export interface AutoFormLayoutConfig<C extends IsComponent = IsComponent> {
  /** 布局组件 */
  component?: C
  /** 布局组件属性 - 根据组件类型自动推断 */
  props?: ComponentProps<C>
  /** 布局组件 class */
  class?: ClassNameValue
  /** 布局组件插槽 - 根据组件类型自动推断 */
  slots?: Partial<ComponentSlots<C>>
  /** 布局内的字段 - 使用对象形式，类似 z.object() 的 shape */
  fields: Record<string, z.ZodType>
}

export type AutoFormMergeMeta = GlobalMeta
  & AutoFormControlsMeta
  & { mapped?: AutoFormControl, layout?: AutoFormLayoutConfig, overwrite?: AutoFormControlsMeta }

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
  TExtraParams extends any[] = []
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

type KeysOf<T> = Extract<keyof T, string>
type WithDefaultControls<TControls, DFTC> = TControls & DFTC

/** 布局标记类型 - 用于类型层面识别 */
interface LayoutFieldMarker<Fields extends Record<string, z.ZodType>> {
  __brand: typeof AUTOFORM_META.LAYOUT_KEY
  fields: Fields
}

/** 移除所有布局标记字段 */
type FilterLayoutMarkers<S extends Record<string, any>> = {
  [K in keyof S as S[K] extends LayoutFieldMarker<any> ? never : K]: S[K]
}

/** 联合类型转交叉类型 */
type UnionToIntersection<U> = (U extends any ? (k: U) => void : never) extends ((k: infer I) => void) ? I : never

/** 提取所有布局的 fields 并合并 */
type ExtractAllLayoutFields<S extends Record<string, any>> = UnionToIntersection<
  {
    [K in keyof S]: S[K] extends LayoutFieldMarker<infer Fields> ? Fields : {}
  }[keyof S]
>

/** 最终 shape = 普通字段 + 所有布局字段 */
type ExtractLayoutShape<S extends Record<string, any>>
  = FilterLayoutMarkers<S> & ExtractAllLayoutFields<S>

export interface TypedZodFactory<TC extends AutoFormControls, DFTC extends AutoFormControls> {
  string: AutoFormFactoryMethod<WithDefaultControls<TC, DFTC>, 'string', z.ZodString>
  number: AutoFormFactoryMethod<WithDefaultControls<TC, DFTC>, 'number', z.ZodNumber>
  boolean: AutoFormFactoryMethod<WithDefaultControls<TC, DFTC>, 'boolean', z.ZodBoolean>

  date: <T = CalendarDate>(meta?: any) => z.ZodType<T>

  // 数组工厂方法 - 第二个参数用于指定数组级控件配置
  array: {
    // 传入控件类型字符串
    <T extends z.ZodType, K extends KnownKeys<WithDefaultControls<TC, DFTC>> & keyof WithDefaultControls<TC, DFTC> & string>(
      element: T,
      overwrite?: { type: Suggest<K>, component?: never } & MetaByType<WithDefaultControls<TC, DFTC>, K>
    ): z.ZodArray<T>
    // 传入控件组件
    <T extends z.ZodType, C extends IsComponent>(
      element: T,
      overwrite?: { component: C, type?: never } & OmitControlMeta<C>
    ): z.ZodArray<T>
  }

  // 元组工厂方法 - 第二个参数用于指定元组级控件配置
  tuple: {
    // 传入控件类型字符串
    <T extends readonly [z.ZodType, ...z.ZodType[]], K extends KnownKeys<WithDefaultControls<TC, DFTC>> & keyof WithDefaultControls<TC, DFTC> & string>(
      schemas: T,
      overwrite?: { type: Suggest<K>, component?: never } & MetaByType<WithDefaultControls<TC, DFTC>, K>
    ): z.ZodTuple<T>
    // 传入控件组件
    <T extends readonly [z.ZodType, ...z.ZodType[]], C extends IsComponent>(
      schemas: T,
      overwrite?: { component: C, type?: never } & OmitControlMeta<C>
    ): z.ZodTuple<T>
  }

  // 布局方法 - 返回布局标记类型（仅用于类型层面，运行时返回 ZodCustom）
  layout: <C extends IsComponent = IsComponent, Fields extends Record<string, z.ZodType> = Record<string, z.ZodType>>(
    config: Omit<AutoFormLayoutConfig<C>, 'fields'> & { fields: Fields }
  ) => LayoutFieldMarker<Fields>

  // 函数重载：支持两种写法
  object: {
    // 1. 柯里化写法：afz.object<State>()({...}, meta?) - 类型约束和推断
    <T extends object>(): <S extends Record<string, any>>(
      shape: S & Partial<Record<KeysOf<T>, any>>,
      meta?: any
    ) => z.ZodObject<ExtractLayoutShape<S>, z.core.$strip>

    // 2. 直接写法：afz.object({...}, meta?) - 简化语法，保持类型推断
    <S extends Record<string, any>>(
      shape: S,
      meta?: any
    ): z.ZodObject<ExtractLayoutShape<S>, z.core.$strip>
  }

  looseObject: {
    <T extends object>(): <S extends Record<string, any>>(
      shape: S & Partial<Record<KeysOf<T>, any>>,
      meta?: any
    ) => z.ZodObject<ExtractLayoutShape<S>, z.core.$loose>

    <S extends Record<string, any>>(
      shape: S,
      meta?: any
    ): z.ZodObject<ExtractLayoutShape<S>, z.core.$loose>
  }

  strictObject: {
    <T extends object>(): <S extends Record<string, any>>(
      shape: S & Partial<Record<KeysOf<T>, any>>,
      meta?: any
    ) => z.ZodObject<ExtractLayoutShape<S>, z.core.$strict>

    <S extends Record<string, any>>(
      shape: S,
      meta?: any
    ): z.ZodObject<ExtractLayoutShape<S>, z.core.$strict>
  }
}
