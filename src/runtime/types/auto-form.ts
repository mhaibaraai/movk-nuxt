import type { ComponentProps, ComponentSlots, IsComponent } from '../core'

export interface AutoFormControl<C extends IsComponent> {
  component: C
  props?: ComponentProps<C>
  slots?: ComponentSlots<C>
}

export type AutoFormControls = Record<string, AutoFormControl<IsComponent>>

// 基础控件映射类型（在下方声明 AutoFormControl / AutoFormControls 后使用）
interface MetaBase<TControls> extends Omit<import('zod/v4').GlobalAutoFormMeta, 'controlProps' | 'controlSlots' | 'component' | 'type'> {
  component?: IsComponent
  type?: keyof TControls
}

// 根据“component”直接推断 props/slots（内部）
interface WithByComponent<C> {
  controlProps?: ComponentProps<C>
  controlSlots?: Partial<ComponentSlots<C>>
}

// 根据“type”在控件映射中推断 props/slots
type WithByType<TControls, K extends keyof TControls>
  = TControls[K] extends AutoFormControl<infer C>
    ? { controlProps?: ComponentProps<C>, controlSlots?: Partial<ComponentSlots<C>> }
    : object

// 根据“Zod 基本类型”在控件映射中推断 props/slots（兜底）
type WithByZod<TControls, TZod extends string>
  = TZod extends keyof TControls
    ? TControls[TZod] extends AutoFormControl<infer C>
      ? { controlProps?: ComponentProps<C>, controlSlots?: Partial<ComponentSlots<C>> }
      : { controlProps?: object, controlSlots?: object }
    : { controlProps?: object, controlSlots?: object }

// 统一的工厂方法签名：支持三段优先级（component > type > zodType）
export type FactoryMethod<
  TControls,
  TZod extends string,
  TResult,
  TExtraParams extends any[] = [],
> = {
  (...args: [...TExtraParams, meta?: MetaBase<TControls> & { component?: never, type?: never } & WithByZod<TControls, TZod>]): TResult
} & {
  <K extends keyof TControls>(...args: [...TExtraParams, meta: MetaBase<TControls> & { type: K, component?: never } & WithByType<TControls, K>]): TResult
} & {
  <C>(...args: [...TExtraParams, meta: MetaBase<TControls> & { component: C } & WithByComponent<C>]): TResult
}
