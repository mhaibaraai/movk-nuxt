import type { z } from 'zod/v4'

export * from './api'
export * from './theme'

// AutoForm 元数据与选项类型（遵循“事实对齐”与 Zod v4 metadata/registry）

export interface FieldMeta {
  // UFormField 对齐的字段级元数据
  label?: string
  description?: string
  hint?: string
  help?: string
  error?: string
  required?: boolean
  size?: string
  eagerValidation?: boolean
  validateOnInputDelay?: number
  ui?: Record<string, any>

  // 控件级配置与扩展
  type?: string
  component?: any
  controlProps?: Record<string, any>
  controlUi?: Record<string, any>

  // 选择/联合/数据源协议
  discriminant?: string
  items?: Array<{ label: string, value: any, [k: string]: any }>
  itemsProvider?: (query?: string, ctx?: any) => Promise<any[]> | any[]
  itemsRefKey?: string
}

export type AutoFormRegistryMeta = FieldMeta

export interface AutoFormOptions {
  // 控件映射（type → Vue 组件或渲染描述）
  controls?: Record<string, any>
  // 日志级别
  logLevel?: 'silent' | 'warn' | 'debug'
}

// --------- 类型推断与控件 Props 提示 ---------

export type InferZodOutput<T extends z.ZodType> = z.infer<T>

export type ControlType
  = | 'UInput'
    | 'UInputNumber'
    | 'USwitch'
    | 'USelect'
    | 'USelectMenu'
    | 'UInputMenu'
    | 'UFileUpload'

export interface BaseControlProps<T> {
  modelValue?: T
  disabled?: boolean
  placeholder?: string
}

export interface SelectItem<T> { label: string, value: T, [k: string]: any }
export type SelectModelValue<T, M extends boolean> = M extends true ? T[] : T
export interface SelectControlProps<T, M extends boolean = false> extends BaseControlProps<SelectModelValue<T, M>> {
  items?: Array<SelectItem<T>>
  multiple?: M
}

export type FileModelValue<M extends boolean> = M extends true ? File[] : File
export interface FileUploadControlProps<M extends boolean = false> extends BaseControlProps<FileModelValue<M>> {
  multiple?: M
  accept?: string
}

export type ControlProps<C extends ControlType, T, M extends boolean = false>
  = C extends 'UFileUpload' ? FileUploadControlProps<M>
    : C extends 'USelect' | 'USelectMenu' | 'UInputMenu' ? SelectControlProps<T, M>
      : C extends 'UInputNumber' ? BaseControlProps<number>
        : C extends 'USwitch' ? BaseControlProps<boolean>
          : BaseControlProps<T>

export type FieldMetaWith<C extends ControlType, T, M extends boolean = false> = Omit<FieldMeta, 'type' | 'controlProps'> & {
  type: C
  controlProps?: ControlProps<C, T, M>
}

export function defineFieldMeta<C extends ControlType, T, M extends boolean = false>(meta: FieldMetaWith<C, T, M>) {
  return meta
}
