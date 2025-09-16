import type { FormFieldSlots } from '@nuxt/ui'
import type { ComputedRef, Ref } from 'vue'

/**
 * 字段上下文 - 精简至必要参数
 */
export interface FieldContext {
  /** 表单状态 - 使用 getter 确保获取最新值 */
  readonly state: any
  /** 字段路径 */
  readonly path: string
  /** 字段值 - 使用 getter 确保获取最新值 */
  readonly value: any
  /** 设置字段值 */
  setValue: (value: any) => void
}

/**
 * 响应式值类型 - 支持静态值、函数、Ref、Computed
 */
export type ReactiveValue<T, C = FieldContext> = T | ((ctx: C) => T) | Ref<T> | ComputedRef<T>

/**
 * 深度响应式对象 - 递归应用 ReactiveValue
 */
export type DeepReactive<T, C = FieldContext> = T extends object
  ? T extends (...args: any[]) => any
    ? ReactiveValue<T, C>
    : { [K in keyof T]: DeepReactive<T[K], C> }
  : ReactiveValue<T, C>

declare module 'zod/v4' {
  interface GlobalMeta extends GlobalAutoFormMeta { }
  interface GlobalAutoFormMeta {
    /**
     * The element or component this component should render as.
     * @defaultValue 'div'
     */
    as?: any
    /** The name of the FormField. Also used to match form errors. */
    name?: string
    /** A regular expression to match form error names. */
    errorPattern?: RegExp
    label?: ReactiveValue<string>
    description?: ReactiveValue<string>
    help?: ReactiveValue<string>
    error?: ReactiveValue<boolean | string>
    hint?: ReactiveValue<string>
    /**
     * @defaultValue 'md'
     */
    size?: ReactiveValue<'md' | 'xs' | 'sm' | 'lg' | 'xl'>
    /**
     * @defaultValue true
     */
    required?: ReactiveValue<boolean>
    /** If true, validation on input will be active immediately instead of waiting for a blur event. */
    eagerValidation?: boolean
    /**
     * Delay in milliseconds before validating the form on input events.
     * @defaultValue `300`
     */
    validateOnInputDelay?: number
    class?: ReactiveValue<any>
    ui?: ReactiveValue<{ root?: string, wrapper?: string, labelWrapper?: string, label?: string, container?: string, description?: string, error?: string, hint?: string, help?: string }>
    /**
     * @see https://ui4.nuxt.com/docs/components/form-field#slots
     */
    fieldSlots?: ReactiveValue<Partial<FormFieldSlots>>
  }
}

export { }
