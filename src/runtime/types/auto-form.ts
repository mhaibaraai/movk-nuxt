import type { OmitByKey, RequiredByKeys } from '@movk/core'
import type { GlobalMeta, z } from 'zod/v4'
import type { ComponentProps, ComponentSlots, IsComponent, Suggest } from '../core'
import type { DeepReactive, FieldContext, ReactiveValue } from './zod'

/**
 * 控件元数据（统一模型）- 支持响应式
 */
export interface AutoFormControlsMeta<C extends IsComponent = IsComponent> {
  /** 控件类型（注册键名） */
  type?: string
  /** 控件组件（直传组件时使用） */
  component?: C
  /** 控件显示状态 */
  hidden?: ReactiveValue<boolean>
  /** 控件条件 */
  if?: ReactiveValue<boolean>
  /** 控件属性 */
  props?: DeepReactive<ComponentProps<C>>
  /** 控件插槽（调用侧可部分覆盖） */
  slots?: DeepReactive<Partial<ComponentSlots<C>>>
}

export type AutoFormControl<C extends IsComponent = IsComponent> = RequiredByKeys<OmitByKey<AutoFormControlsMeta<C>, 'type'>, 'component'>

export interface AutoFormControls {
  [key: string]: AutoFormControl
}

/**
 * AutoForm 字段接口，基于 introspectSchema 的返回结果扩展
 */
export interface AutoFormField {
  path: string
  schema: z.ZodType
  originalSchema: z.ZodType
  zodType: string
  meta: GlobalMeta & { props?: any, slots?: any }
  decorators: {
    isOptional: boolean
    defaultValue?: any
    description?: string
  }
  control?: {
    type?: string
    component?: IsComponent
    props?: any
    slots?: any
    hidden?: any
    if?: any
  }
}

/**
 * 字段上下文泛型接口，提供类型安全的字段访问
 */
// export interface AutoFormFieldContext {
//   /** 表单值 - 使用 getter 确保获取最新值 */
//   readonly state: any
//   /** 字段路径 */
//   readonly path: string
//   /** 字段值 - 使用 getter 确保获取最新值 */
//   readonly value: any
//   /** 设置字段值 */
//   setValue: (value: any) => void
// }

/**
 * 动态字段插槽类型，基于字段路径生成插槽
 */
type _DynamicFieldSlots<T, F, SlotProps = { field: F, state: T }>
  = Record<string, (props: SlotProps) => any>
    & Record<`${keyof T extends string ? keyof T : never}-field`, (props: SlotProps) => any>

/**
 * 动态表单字段插槽类型，支持标准表单字段插槽
 */
type _DynamicFormFieldSlots<T>
  = Record<string, (props?: object) => any>
    & Record<`${keyof T extends string ? keyof T : never}-${'label' | 'description' | 'hint' | 'help' | 'error'}`, (props?: object) => any>

/**
 * AutoForm 插槽类型，集成动态插槽支持
 */
export interface AutoFormSlots<_T extends z.ZodObject = z.ZodObject<any>, F extends AutoFormField = AutoFormField> {
  'before-fields': (props: { fields: F[], state: any }) => any
  'after-fields': (props: { fields: F[], state: any }) => any
  'default': (props: { error: any, field: F, state: any, value: any, setValue: (v: any) => void }) => any
  'label': (props: { label?: string, field: F, state: any, value: any, setValue: (v: any) => void }) => any
  'description': (props: { description?: string, field: F, state: any, value: any, setValue: (v: any) => void }) => any
  'hint': (props: { hint?: string, field: F, state: any, value: any, setValue: (v: any) => void }) => any
  'help': (props: { help?: string, field: F, state: any, value: any, setValue: (v: any) => void }) => any
  'error': (props: { error: any, field: F, state: any, value: any, setValue: (v: any) => void }) => any
  [key: string]: ((props?: any) => any) | undefined
}

/**
 * 从 Zod schema 提取字段路径的类型工具
 * TODO: 需要实现更复杂的路径提取逻辑
 */
export type ExtractFieldPaths<_T extends z.ZodObject> = string

/**
 * 根据路径提取字段类型的类型工具
 * TODO: 需要实现更精确的类型提取逻辑
 */
export type ExtractFieldType<_T extends z.ZodObject, _P extends string> = any

/**
 * 为插槽提供精确的属性类型
 */
export interface SlotProps<_T extends z.ZodObject, P extends string> {
  field: AutoFormField & { path: P }
  state: any
  value: ExtractFieldType<_T, P>
  setValue: (value: ExtractFieldType<_T, P>) => void
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

type OmitControlMeta<T extends IsComponent = IsComponent> = OmitByKey<AutoFormControlsMeta<T>, 'component' | 'type'>

type MetaByType<TControls, K extends keyof TControls>
  = TControls[K] extends AutoFormControl<infer C>
    ? OmitControlMeta<C>
    : OmitControlMeta

type MetaByZod<TControls, TZod extends string>
  = TZod extends KnownKeys<TControls>
    ? TControls[TZod] extends AutoFormControl<infer C>
      ? OmitControlMeta<C>
      : OmitControlMeta
    : OmitControlMeta

export type AutoFormFactoryMethod<
  TControls,
  TZod extends string,
  TResult,
  TExtraParams extends any[] = [],
> = {
  (...args: [...TExtraParams, ({ component?: never, type?: never } & MetaByZod<TControls, TZod>)?]): TResult
} & {
  <K extends KnownKeys<TControls> & keyof TControls & string>(
    ...args: [...TExtraParams, ({ type: Suggest<K>, component?: never } & MetaByType<TControls, K>)?]
  ): TResult
} & {
  <C extends IsComponent>(
    ...args: [...TExtraParams, ({ component: C, type?: never } & OmitControlMeta<C>)?]
  ): TResult
} & {
  (...args: [...TExtraParams, AutoFormControlsMeta?]): TResult
}
