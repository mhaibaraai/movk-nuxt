import type { ButtonProps, FormProps, FormSubmitEvent, FormData, FormErrorEvent } from '@nuxt/ui'
import type { z } from 'zod'
import type { BaseAutoFormProps } from './base'
import type { AutoFormSlotProps, DynamicFormSlots } from './slots'
import type { VNode } from 'vue'

export interface AutoFormProps<S extends z.ZodObject = z.ZodObject, T extends boolean = true, N extends boolean = false>
  extends BaseAutoFormProps<S, T, N> {
  /** 表单的状态对象。 */
  state?: FormProps<S, T, N>['state']
  /**
   * 是否显示默认提交按钮
   * @defaultValue true
   */
  submit?: boolean
  /** 提交按钮属性 */
  submitButtonProps?: ButtonProps
  /** 数组字段添加按钮属性 */
  addButtonProps?: ButtonProps
}

export type AutoFormSubmitHandler<S extends z.ZodObject, T extends boolean = true> = (event: FormSubmitEvent<FormData<S, T>>) => void

export type AutoFormErrorHandler = (event: FormErrorEvent) => void

export interface AutoFormEmits {
  error: [FormErrorEvent]
}

export type AutoFormSlots<T extends object> = {
  header(props: AutoFormSlotProps<T>): VNode[]
  footer(props: AutoFormSlotProps<T>): VNode[]
  submit(props: AutoFormSlotProps<T>): VNode[]
} & DynamicFormSlots<T>
