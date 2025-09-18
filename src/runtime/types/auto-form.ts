import type { OmitByKey, RequiredByKeys } from '@movk/core'
import type { FormData, FormError, FormErrorEvent, FormInputEvents, FormSubmitEvent, InferInput } from '@nuxt/ui'
import type { ComputedRef, Ref } from 'vue'
import type { GlobalMeta, z } from 'zod/v4'
import type { ComponentProps, ComponentSlots, IsComponent, Suggest } from '../core'

export interface AutoFormFieldContext<S = any> {
  /** 表单数据 - 使用 getter 确保获取最新值 */
  readonly state: S
  /** 当前字段 - 使用 getter 确保获取最新值 */
  readonly field: AutoFormField
  /** 字段路径 */
  readonly path: string
  /** 字段值 - 使用 getter 确保获取最新值 */
  readonly value: S[keyof S]
  /** 设置字段值 */
  setValue: (value: S[keyof S]) => void
}

/**
 * 响应式值类型 - 支持静态值、函数、Ref、Computed
 */
export type ReactiveValue<T> = T | ((ctx: AutoFormFieldContext) => T) | Ref<T> | ComputedRef<T>

/**
 * 深度响应式对象 - 递归应用 ReactiveValue
 */
export type DeepReactive<T> = T extends object
  ? T extends (...args: any[]) => any
    ? ReactiveValue<T>
    : { [K in keyof T]: DeepReactive<T[K]> }
  : ReactiveValue<T>

/**
 * 控件元数据（统一模型）- 支持响应式
 */
export interface AutoFormControlsMeta<C extends IsComponent = IsComponent> {
  /** 控件类型（注册键名） */
  type?: string
  /** 控件组件（直传组件时使用） */
  component?: C
  /** 控件显示状态 */
  hidden?: ReactiveValue<boolean>
  /** 控件条件 */
  if?: ReactiveValue<boolean>
  /** 控件属性 */
  props?: DeepReactive<ComponentProps<C>>
  /** 控件插槽（调用侧可部分覆盖） */
  slots?: DeepReactive<Partial<ComponentSlots<C>>>
}

export type AutoFormControl<C extends IsComponent = IsComponent> = RequiredByKeys<OmitByKey<AutoFormControlsMeta<C>, 'type'>, 'component'>

export interface AutoFormControls {
  [key: string]: AutoFormControl
}

export interface AutoFormField {
  path: string
  schema: z.ZodType
  originalSchema: z.ZodType
  meta: GlobalMeta & AutoFormControlsMeta
  controlMeta: AutoFormControlsMeta
  decorators: {
    isOptional: boolean
    defaultValue?: any
    description?: string
  }
}

/** 提取对象的“已知键”（剔除 string/number/symbol 索引） */
type KnownKeys<T> = {
  [K in keyof T]-?: string extends K
    ? never
    : number extends K
      ? never
      : symbol extends K
        ? never
        : K
}[keyof T]

type OmitControlMeta<T extends IsComponent = IsComponent> = OmitByKey<AutoFormControlsMeta<T>, 'component' | 'type'>

type MetaByType<TControls, K extends keyof TControls>
  = TControls[K] extends AutoFormControl<infer C>
    ? OmitControlMeta<C>
    : OmitControlMeta

type MetaByZod<TControls, TZod extends string>
  = TZod extends KnownKeys<TControls>
    ? TControls[TZod] extends AutoFormControl<infer C>
      ? OmitControlMeta<C>
      : OmitControlMeta
    : OmitControlMeta

export type AutoFormFactoryMethod<
  TControls,
  TZod extends string,
  TResult,
  TExtraParams extends any[] = [],
> = {
  (...args: [...TExtraParams, ({ component?: never, type?: never } & MetaByZod<TControls, TZod>)?]): TResult
} & {
  <K extends KnownKeys<TControls> & keyof TControls & string>(
    ...args: [...TExtraParams, ({ type: Suggest<K>, component?: never } & MetaByType<TControls, K>)?]
  ): TResult
} & {
  <C extends IsComponent>(
    ...args: [...TExtraParams, ({ component: C, type?: never } & OmitControlMeta<C>)?]
  ): TResult
} & {
  (...args: [...TExtraParams, AutoFormControlsMeta<IsComponent>?]): TResult
}

export interface AutoFormProps<S extends z.ZodObject, T extends boolean = true, N extends boolean = false> {
  id?: string | number
  /** Schema to validate the form state. Supports Standard Schema objects, Yup, Joi, and Superstructs. */
  schema?: S
  /**
   * Custom validation function to validate the form state.
   * @param state - The current state of the form.
   * @returns A promise that resolves to an array of FormError objects, or an array of FormError objects directly.
   */
  validate?: (state: Partial<InferInput<S>>) => Promise<FormError[]> | FormError[]

  /**
   * The list of input events that trigger the form validation.
   * @remarks The form always validates on submit.
   * @defaultValue `['blur', 'change', 'input']`
   */
  validateOn?: FormInputEvents[]

  /** Disable all inputs inside the form. */
  disabled?: boolean

  /**
   * Path of the form's state within it's parent form.
   * Used for nesting forms. Only available if `nested` is true.
   */
  name?: N extends true ? string : never

  /**
   * Delay in milliseconds before validating the form on input events.
   * @defaultValue `300`
   */
  validateOnInputDelay?: number
  /**
   * If true, applies schema transformations on submit.
   * @defaultValue `true`
   */
  transform?: T

  /**
   * If true, this form will attach to its parent Form and validate at the same time.
   * @defaultValue `false`
   */
  nested?: N

  /**
   * When `true`, all form elements will be disabled on `@submit` event.
   * This will cause any focused input elements to lose their focus state.
   * @defaultValue `true`
   */
  loadingAuto?: boolean
  class?: any
  onSubmit?: ((event: FormSubmitEvent<FormData<S, T>>) => void | Promise<void>) | (() => void | Promise<void>)

  controls?: AutoFormControls
  size?: 'md' | 'xs' | 'sm' | 'lg' | 'xl'
}

export interface AutoFormEmits<S extends z.ZodObject, T extends boolean = true> {
  submit: [event: FormSubmitEvent<FormData<S, T>>]
  error: [event: FormErrorEvent]
}

export type AutoFormSlots<T extends object, SlotProps extends AutoFormFieldContext> = {
  'before-fields': (props: { fields: AutoFormField[], state: T }) => any
  'after-fields': (props: { fields: AutoFormField[], state: T }) => any
} & DynamicFieldSlots<SlotProps> & DynamicFormFieldSlots<T, SlotProps>

type DynamicFieldSlotKeys = 'default' | 'label' | 'description' | 'hint' | 'help' | 'error'

type DynamicFieldSlots<SlotProps>
  = Record<string, (props: SlotProps) => any>
    & Record<`${DynamicFieldSlotKeys}`, (props: SlotProps) => any>

type DynamicFormFieldSlots<T, SlotProps>
  = Record<string, (props?: SlotProps) => any>
    & Record<`${DynamicFieldSlotKeys}:${keyof T extends string ? keyof T : never}`, (props?: SlotProps) => any>
