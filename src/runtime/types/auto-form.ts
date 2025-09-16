import type { OmitByKey, RequiredByKeys } from '@movk/core'
import type { ComponentProps, ComponentSlots, IsComponent } from '../core'
import type { DeepReactive, ReactiveValue } from './zod'

/**
 * 控件元数据（统一模型）- 支持响应式
 */
export interface AutoFormControlsMeta<C extends IsComponent = IsComponent> {
  /** 控件类型（注册键名） */
  type: string
  /** 控件组件（直传组件时使用） */
  component?: C
  /** 控件显示状态 */
  show?: ReactiveValue<boolean>
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

type Suggest<T extends string> = T | (string & {})

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
