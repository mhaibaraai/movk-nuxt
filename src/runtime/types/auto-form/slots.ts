import type { z } from 'zod'
import type { FormError } from '@nuxt/ui'
import type { ArrayFieldKeys, NonObjectFieldKeys, ObjectFieldKeys } from '@movk/core'
import type { AutoFormFieldContext, AutoFormFieldSlots } from './fields'
import type { AutoFormMergeMeta } from './controls'
import type { VNode } from 'vue'

export interface AutoFormField {
  path: string
  schema: z.ZodType
  meta: AutoFormMergeMeta
  decorators: {
    isOptional?: boolean
    isReadonly?: boolean
    defaultValue?: unknown
    description?: string
  }
  children?: AutoFormField[]
  arrayElement?: AutoFormField
}

export interface AutoFormSlotProps<T extends object> {
  errors: FormError[]
  loading: boolean
  fields: AutoFormField[]
  state: T
}

/** 插槽附加 props 查找表 */
type SlotExtraPropsMap = {
  label: { label?: string }
  hint: { hint?: string }
  description: { description?: string }
  help: { help?: string }
  error: { error?: boolean | string }
  default: { error?: boolean | string }
}

type _FormGenericSlots<T> = {
  [K in keyof AutoFormFieldSlots as `field-${K}`]: (props: SlotExtraPropsMap[K] & AutoFormFieldContext<T>) => VNode[]
}

type _FieldPath<T> = string & (NonObjectFieldKeys<T> | ObjectFieldKeys<T>)
type _NestedPath<T> = string & (ObjectFieldKeys<T> | ArrayFieldKeys<T>)

type _SlotEntry = {
  key: PropertyKey
  props: unknown
}

type _EntryToSlots<E extends _SlotEntry> = {
  [Entry in E as Entry['key']]: (props: Entry['props']) => VNode[]
}

type _FormKeyedSlotEntry<T> = {
  [K in keyof AutoFormFieldSlots]: {
    [P in _FieldPath<T>]: {
      key: `field-${K}:${P}`
      props: SlotExtraPropsMap[K] & AutoFormFieldContext<T, P>
    }
  }[_FieldPath<T>]
}[keyof AutoFormFieldSlots]

type _NestedSlotName = 'content' | 'before' | 'after'

type _FormNestedSlotEntry<T> = {
  [P in _NestedPath<T>]: {
    key: `field-${_NestedSlotName}:${P}`
    props: AutoFormFieldContext<T, P>
  }
}[_NestedPath<T>]

type _FormKeyedSlots<T> = _EntryToSlots<_FormKeyedSlotEntry<T>>
type _FormNestedSlots<T> = _EntryToSlots<_FormNestedSlotEntry<T>>

/**
 * 动态表单插槽类型
 *
 * 插槽命名：
 * - 通用：`field-{slotType}`
 * - 字段：`field-{slotType}:{fieldKey}` — 精确推导字段类型
 * - 嵌套：`field-{content|before|after}:{objectKey|arrayKey}`
 */
export type DynamicFormSlots<T>
  = _FormGenericSlots<T>
    & _FormKeyedSlots<T>
    & _FormNestedSlots<T>
