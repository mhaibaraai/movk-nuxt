import type { OmitByKey, RequiredByKeys } from '@movk/core'
import type { GlobalMeta, z } from 'zod/v4'
import type { ComponentProps, ComponentSlots, IsComponent, ReactiveValue, Suggest } from '../core'

type DynamicFieldSlotKeys = 'default' | 'label' | 'description' | 'hint' | 'help' | 'error'

export type DynamicFormSlots<T>
  = Record<string, (props: AutoFormFieldContext<T>) => any>
    & Record<`${DynamicFieldSlotKeys}`, (props: AutoFormFieldContext<T>) => any>
    & Record<`${DynamicFieldSlotKeys}:${keyof T extends string ? keyof T : never}`, (props: AutoFormFieldContext<T>) => any>

export interface AutoFormFieldContext<S = any> {
  /** 表单数据 - 使用 getter 确保获取最新值 */
  readonly state: S
  /** 字段路径 */
  readonly path: string
  /** 字段值 - 使用 getter 确保获取最新值 */
  readonly value: S[keyof S]
  /** 设置字段值 */
  setValue: (value: S[keyof S]) => void
}

/**
 * 控件元数据（统一模型）- 支持响应式
 */
export interface AutoFormControlsMeta<C extends IsComponent = IsComponent> {
  /** 控件类型（注册键名） */
  type?: string
  /** 控件组件（直传组件时使用） */
  component?: C
  /** 控件显示状态 */
  hidden?: ReactiveValue<boolean, AutoFormFieldContext>
  /** 控件条件 */
  if?: ReactiveValue<boolean, AutoFormFieldContext>
  /** 控件属性 */
  props?: ReactiveValue<ComponentProps<C>, AutoFormFieldContext>
  /** 控件插槽（调用侧可部分覆盖） */
  slots?: ReactiveValue<Partial<ComponentSlots<C>>, AutoFormFieldContext>
}

export type AutoFormControl<C extends IsComponent = IsComponent> = RequiredByKeys<OmitByKey<AutoFormControlsMeta<C>, 'type'>, 'component'>

export interface AutoFormControls {
  [key: string]: AutoFormControl
}

export interface AutoFormField {
  path: string
  schema: z.ZodType
  originalSchema: z.ZodType
  meta: GlobalMeta & AutoFormControlsMeta
  controlMeta: AutoFormControlsMeta
  decorators: {
    isOptional: boolean
    defaultValue?: any
    description?: string
  }
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
  (...args: [...TExtraParams, ({ component?: never, type?: never } & MetaByZod<TControls, TZod>)?]): TResult
} & {
  <K extends KnownKeys<TControls> & keyof TControls & string>(
    ...args: [...TExtraParams, ({ type: Suggest<K>, component?: never } & MetaByType<TControls, K>)?]
  ): TResult
} & {
  <C extends IsComponent>(
    ...args: [...TExtraParams, ({ component: C, type?: never } & OmitControlMeta<C>)?]
  ): TResult
}
