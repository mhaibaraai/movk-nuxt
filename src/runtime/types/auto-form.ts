import type { ComponentProps, ComponentSlots, IsComponent } from '../core'

export interface AutoFormControl<C extends IsComponent> {
  component: C
  props?: ComponentProps<C>
  slots?: ComponentSlots<C>
}

export type AutoFormControls<TKey extends string = string> = {
  [K in TKey]: AutoFormControl<IsComponent>
}

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

interface WithByComponent<C> {
  props?: ComponentProps<C>
  slots?: Partial<ComponentSlots<C>>
}

type WithByType<TControls, K extends keyof TControls>
  = TControls[K] extends AutoFormControl<infer C>
    ? { props?: ComponentProps<C>, slots?: Partial<ComponentSlots<C>> }
    : object

type WithByZod<TControls, TZod extends string>
  = TZod extends KnownKeys<TControls>
    ? TControls[TZod] extends AutoFormControl<infer C>
      ? { props?: ComponentProps<C>, slots?: Partial<ComponentSlots<C>> }
      : { props?: object, slots?: object }
    : { props?: object, slots?: object }

export type FactoryMethod<
  TControls,
  TZod extends string,
  TResult,
  TExtraParams extends any[] = [],
> = {
  // 无 type：按 zod 类型默认映射
  (...args: [...TExtraParams, ({ component?: never, type?: never } & WithByZod<TControls, TZod>)?]): TResult
} & {
  // 精确键联合（有提示）：同时允许任意字符串输入（编辑期占位）
  <K extends KnownKeys<TControls> & keyof TControls & string>(
    ...args: [...TExtraParams, ({ type: Suggest<K>, component?: never } & WithByType<TControls, K>)?]
  ): TResult
} & {
  // 传组件
  <C extends IsComponent>(
    ...args: [...TExtraParams, ({ component: C, type?: never } & WithByComponent<C>)?]
  ): TResult
} & {
  // 宽松回退：任意字符串可通过，但 props/slots 推断丢失（仅作兜底）
  (...args: [...TExtraParams, ({ type: string, component?: never, props?: object, slots?: object })?]): TResult
}
