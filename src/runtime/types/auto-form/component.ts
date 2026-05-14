import type { ButtonProps, FormEmits, FormProps, FormSubmitEvent, FormData, FormErrorEvent } from '@nuxt/ui'
import type { z } from 'zod'
import type { OmitByKey } from '@movk/core'
import type { ZodAutoFormFieldMeta } from '../zod'
import type { AutoFormControls } from './controls'
import type { AutoFormSlotProps, DynamicFormSlots } from './slots'
import type { ClassNameValue } from '../shared'
import type { VNode } from 'vue'

export interface AutoFormProps<S extends z.ZodObject = z.ZodObject, T extends boolean = true, N extends boolean = false>
  extends /** @vue-ignore */ OmitByKey<FormProps<S, T, N>, 'schema' | 'state' | 'loadingAuto' | 'validateOn' | 'ui' | 'onSubmit'> {
  /** Zod 对象 schema，定义表单字段 */
  schema: S
  /** 表单的状态对象。 */
  state?: FormProps<S, T, N>['state']
  /**
   * 是否显示默认提交按钮
   * @defaultValue true
   */
  submit?: boolean
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
  loadingAuto?: FormProps<S>['loadingAuto']
  /**
   * 表单验证时机，详见 UForm 的 validateOn 属性
   * @defaultValue []
   */
  validateOn?: FormProps<S, T, N>['validateOn']
  onSubmit?: FormProps<S>['onSubmit']
  ui?: Record<string, ClassNameValue>
}

export type AutoFormSubmitHandler<S extends z.ZodObject, T extends boolean = true> = (event: FormSubmitEvent<FormData<S, T>>) => void

export type AutoFormErrorHandler = (event: FormErrorEvent) => void

export interface AutoFormEmits<S extends z.ZodObject> extends FormEmits<S> { }

export type AutoFormSlots<T extends object> = {
  header(props: AutoFormSlotProps<T>): VNode[]
  footer(props: AutoFormSlotProps<T>): VNode[]
  submit(props: AutoFormSlotProps<T>): VNode[]
} & DynamicFormSlots<T>
