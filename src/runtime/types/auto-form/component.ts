import type { ButtonProps, FormEmits, FormInputEvents, FormProps, InferInput } from '@nuxt/ui'
import type { z } from 'zod'
import type { OmitByKey } from '@movk/core'
import type { ZodAutoFormFieldMeta } from '../zod'
import type { AutoFormControls } from './controls'
import type { AutoFormSlotProps, DynamicFormSlots } from './slots'
import type { ClassNameValue } from '../shared'

export interface AutoFormProps<S extends z.ZodObject = z.ZodObject, T extends boolean = true, N extends boolean = false> extends /** @vue-ignore */ OmitByKey<FormProps<S, T, N>, 'schema' | 'state' | 'loadingAuto' | 'validateOn' | 'onSubmit' | 'ui'> {
  /** Zod 对象 schema，定义表单字段 */
  schema: S
  /** 表单的状态对象。 */
  state?: N extends false ? Partial<InferInput<S>> : never
  /**
   * 是否显示默认提交按钮
   * @defaultValue true
   */
  submitButton?: boolean
  /** 提交按钮属性 */
  submitButtonProps?: ButtonProps
  /** 自定义控件映射 */
  controls?: AutoFormControls
  /** 全局字段元数据配置 */
  globalMeta?: ZodAutoFormFieldMeta
  /** 数组字段添加按钮属性 */
  addButtonProps?: ButtonProps
  /**
   * 是否启用自动 loading 功能。
   * @defaultValue true
   */
  loadingAuto?: boolean
  /**
   * 表单验证时机，详见 UForm 的 validateOn 属性
   * @defaultValue []
   */
  validateOn?: FormInputEvents[]
  onSubmit?: FormProps<S, T, N>['onSubmit']
  ui?: Record<string, ClassNameValue>
}

export type AutoFormEmits<S extends z.ZodObject, T extends boolean = true> = FormEmits<S, T>

export type AutoFormSlots<T extends object> = {
  header(props: AutoFormSlotProps<T>): any
  footer(props: AutoFormSlotProps<T>): any
  submit(props: AutoFormSlotProps<T>): any
} & DynamicFormSlots<T>
