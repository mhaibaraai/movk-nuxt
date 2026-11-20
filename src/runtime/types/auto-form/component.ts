import type { ButtonProps, Form, FormProps, FormSubmitEvent, FormData, FormErrorEvent } from '@nuxt/ui'
import type { z } from 'zod'
import type { BaseAutoFormProps } from './base'
import type { AutoFormSlotProps, DynamicFormSlots } from './slots'
import type { VNode } from 'vue'

export interface AutoFormProps<S extends z.ZodObject = z.ZodObject, T extends boolean = true, N extends boolean = false>
  extends BaseAutoFormProps<S, T, N> {
  /**
   * 表单状态对象，原地修改。
   * @deprecated 改用 `v-model`
   */
  state?: FormProps<S, T, N>['state']
  /** 外部 loading 状态，与 `loadingAuto` 的提交中状态合并 */
  loading?: boolean
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

export interface AutoFormEmits<S extends z.ZodObject = z.ZodObject> {
  error: [FormErrorEvent]
  /** 重置后的状态快照（基线加字段默认值） */
  reset: [state: Partial<z.input<S>>]
  /** 清空后的状态快照（仅字段默认值） */
  clear: [state: Partial<z.input<S>>]
}

/** AutoForm 与 SearchForm 共同的实例方法 */
export interface AutoFormExposed<S extends z.ZodObject = z.ZodObject> {
  formRef: Form<S> | null
  /** 触发校验并提交 */
  submit: () => Promise<void>
  validate: Form<S>['validate']
  /** 原地恢复为基线并应用字段默认值 */
  reset: () => void
  /** 原地清空为仅含字段默认值的状态 */
  clear: () => void
  /** 以当前状态（或传入值）作为 reset 与 dirty 比较的基线 */
  setBaseline: (state?: Partial<z.input<S>>) => void
  /** 是否有字段相对基线发生变化 */
  isDirty: boolean
  /** 相对基线发生变化的字段路径 */
  dirtyFields: string[]
  getFieldValue: (path: string) => unknown
  setFieldValue: (path: string, value: unknown) => void
}

export type AutoFormSlots<T extends object> = {
  header(props: AutoFormSlotProps<T>): VNode[]
  footer(props: AutoFormSlotProps<T>): VNode[]
  submit(props: AutoFormSlotProps<T>): VNode[]
} & DynamicFormSlots<T>
