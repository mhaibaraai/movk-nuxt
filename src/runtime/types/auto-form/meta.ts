import type { z } from 'zod'
import type { ClassNameValue } from '../shared'
import type { ComponentProps, ComponentSlots, IsComponent, ReactiveValue } from '@movk/core'
import type { ZodAutoFormFieldMeta } from '../zod'
import type { AutoFormFieldContext } from './fields'
import type { AutoFormControl, AutoFormControlsMeta } from './controls'

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
  & AutoFormControlsMeta
  & {
    mapped?: AutoFormControl
    layout?: AutoFormLayoutConfig
    overwrite?: AutoFormControlsMeta
  }
