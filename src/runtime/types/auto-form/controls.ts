import type { ComponentProps, ComponentSlots, IsComponent, ReactiveValue } from '@movk/core'
import type { AutoFormFieldContext } from './fields'

/** 幻影类型哨兵：标记 P/S 未被覆写 */
export type _Unset = { readonly __brand: 'AutoFormControlUnset' }

export interface AutoFormControl<
  C extends IsComponent = IsComponent,
  _P = _Unset,
  _S = _Unset
> {
  component: C
  controlProps?: ComponentProps<C>
  controlSlots?: Partial<ComponentSlots<C>>
}

export type AutoFormControls = Record<string, AutoFormControl<any, any, any>>

export interface AutoFormControlsMeta<C extends IsComponent = IsComponent> {
  type?: string
  component?: C
  controlProps?: ReactiveValue<ComponentProps<C>, AutoFormFieldContext>
  controlSlots?: ReactiveValue<Partial<ComponentSlots<C>>, AutoFormFieldContext> | Record<string, unknown>
  error?: string
}
