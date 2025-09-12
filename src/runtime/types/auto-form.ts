import type { ComponentProps, ComponentSlots, IsComponent } from '../core'

export interface AutoFormControl<C extends IsComponent> {
  component: C
  props?: ComponentProps<C>
  slots?: ComponentSlots<C>
}

export type AutoFormControls = Record<string, AutoFormControl<IsComponent>>

interface MetaBase<TControls, C> {
  type?: keyof TControls
  component?: C
  props?: ComponentProps<C>
  slots?: Partial<ComponentSlots<C>>
}

type WithByType<TControls, K extends keyof TControls>
  = TControls[K] extends AutoFormControl<infer C>
    ? MetaBase<TControls, C>
    : object

type WithByZod<TControls, TZod extends string>
  = TZod extends keyof TControls
    ? TControls[TZod] extends AutoFormControl<infer C>
      ? MetaBase<TControls, C>
      : object
    : object

// 统一的工厂方法签名：支持三段优先级（component > type > zodType）
export type FactoryMethod<
  TControls,
  TZod extends string,
  TResult,
  TExtraParams extends any[] = [],
> = {
  (...args: [...TExtraParams, ({ component?: never, type?: never } & WithByZod<TControls, TZod>)?]): TResult
} & {
  <K extends keyof TControls>(...args: [...TExtraParams, ({ type: K, component?: never } & WithByType<TControls, K>)?]): TResult
} & {
  <C extends IsComponent>(...args: [...TExtraParams, ({ component: C, type?: never } & MetaBase<TControls, C>)?]): TResult
}
