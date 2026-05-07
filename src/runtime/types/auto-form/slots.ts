import type { z } from 'zod'
import type { FormError } from '@nuxt/ui'
import type { ArrayFieldKeys, NonObjectFieldKeys, ObjectFieldKeys } from '@movk/core'
import type { AutoFormFieldContext, AutoFormFieldSlots } from './fields'
import type { AutoFormMergeMeta } from './controls'

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

/**
 * 动态表单插槽类型
 *
 * 插槽命名：
 * - 通用：`field-{slotType}`
 * - 字段：`field-{slotType}:{fieldKey}` — 精确推导字段类型
 * - 嵌套：`field-{content|before|after}:{objectKey|arrayKey}`
 */
export type DynamicFormSlots<T>
  = Record<string, (props: AutoFormFieldContext<T>) => unknown>
    & {
      [K in keyof AutoFormFieldSlots as `field-${K}`]: (props: SlotExtraPropsMap[K] & AutoFormFieldContext<T>) => unknown
    }
    & {
      [Key in `field-${keyof AutoFormFieldSlots}:${NonObjectFieldKeys<T> | ObjectFieldKeys<T>}`]:
      Key extends `field-${infer K extends keyof AutoFormFieldSlots}:${infer P extends string & (NonObjectFieldKeys<T> | ObjectFieldKeys<T>)}`
        ? (props: SlotExtraPropsMap[K] & AutoFormFieldContext<T, P>) => unknown
        : never
    }
    & {
      [P in ObjectFieldKeys<T> | ArrayFieldKeys<T> as `field-${'content' | 'before' | 'after'}:${P}`]: (props: AutoFormFieldContext<T, P>) => unknown
    }
