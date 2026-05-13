import type { z } from 'zod'
import type { ComponentProps, ComponentSlots, IsComponent, ReactiveValue } from '@movk/core'
import type { ClassNameValue } from '../shared'
import type { ZodAutoFormFieldMeta } from '../zod'
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

export type AutoFormControlProps = Partial<Record<string, unknown>>
export type AutoFormControlSlots = Partial<Record<string, unknown>>

export type AutoFormControls = Record<
  string,
  AutoFormControl<IsComponent, AutoFormControlProps, AutoFormControlSlots>
>

export interface AutoFormControlsMeta<C extends IsComponent = IsComponent> {
  type?: string
  component?: C
  controlProps?: ReactiveValue<ComponentProps<C>, AutoFormFieldContext>
  controlSlots?: ReactiveValue<Partial<ComponentSlots<C>>, AutoFormFieldContext> | Record<string, unknown>
  error?: string
}

export interface AutoFormRuntimeControlsMeta {
  type?: string
  component?: IsComponent
  controlProps?: ReactiveValue<AutoFormControlProps, AutoFormFieldContext>
  controlSlots?: ReactiveValue<AutoFormControlSlots, AutoFormFieldContext> | Record<string, unknown>
  error?: string
}

export interface AutoFormLayoutConfig<C extends IsComponent = IsComponent> {
  component?: C
  props?: ReactiveValue<ComponentProps<C>, AutoFormFieldContext>
  class?: ReactiveValue<ClassNameValue, AutoFormFieldContext>
  slots?: ReactiveValue<Partial<ComponentSlots<C>>, AutoFormFieldContext>
  fields: Record<string, z.ZodType>
  fieldSlot?: ReactiveValue<keyof ComponentSlots<C> & string, AutoFormFieldContext>
  fieldSlots?: ReactiveValue<Partial<Record<string, keyof ComponentSlots<C> & string>>, AutoFormFieldContext>
}

export type AutoFormMergeMeta = ZodAutoFormFieldMeta
  & AutoFormRuntimeControlsMeta
  & {
    mapped?: AutoFormControl
    layout?: AutoFormLayoutConfig
    overwrite?: AutoFormRuntimeControlsMeta
  }
