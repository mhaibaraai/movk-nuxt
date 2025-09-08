import type { ComponentProps, ComponentSlots, IsComponent } from '../core'

export interface AutoFormControl<C extends IsComponent> {
  component: C
  props?: ComponentProps<C>
  slots?: ComponentSlots<C>
}

export type AutoFormControls = Record<string, AutoFormControl<IsComponent>>

// 供 meta.type 提示的内建类型集合（不包含文本变体：password/email/url/search/tel）
export type BuiltInAutoFormMetaType
  = | 'string'
    | 'number'
    | 'boolean'
    | 'enum'
    | 'date'
    | 'textarea'
    | 'checkbox'
    | 'checkbox-group'
    | 'radio-group'
    | 'select-menu'
    | 'input-menu'
    | 'slider'
    | 'color'
    | 'tags'
    | 'file'
    | 'pin'
