import type { AnyObject } from '@movk/core'
import type { FormFieldSlots } from '@nuxt/ui'
import type { ComponentProps, ComponentSlots, IsComponent } from '../core'

declare module 'zod/v4' {
  interface GlobalMeta {
    /**
     * The element or component this component should render as.
     * @defaultValue 'div'
     */
    as?: any
    /** The name of the FormField. Also used to match form errors. */
    name?: string
    /** A regular expression to match form error names. */
    errorPattern?: RegExp
    label?: string
    description?: string
    help?: string
    error?: boolean | string
    hint?: string
    /**
     * @defaultValue 'md'
     */
    size?: 'md' | 'xs' | 'sm' | 'lg' | 'xl'
    required?: boolean
    /** If true, validation on input will be active immediately instead of waiting for a blur event. */
    eagerValidation?: boolean
    /**
     * Delay in milliseconds before validating the form on input events.
     * @defaultValue `300`
     */
    validateOnInputDelay?: number
    class?: any
    ui?: { root?: string, wrapper?: string, labelWrapper?: string, label?: string, container?: string, description?: string, error?: string, hint?: string, help?: string }
    /**
     * @see https://ui4.nuxt.com/docs/components/form-field#slots
     */
    fieldSlots?: Partial<FormFieldSlots>

    type?: string
    component?: any
    controlProps?: AnyObject
    controlSlots?: AnyObject
  }
}

// 类型工具 - 简化的控件解析系统
export type ResolveControlType<TMeta, TControls, TZodType>
  = TMeta extends { component: infer C }
    ? { component: C, props: ComponentProps<C>, slots: ComponentSlots<C> }
    : TMeta extends { type: infer T }
      ? T extends keyof TControls
        ? TControls[T] extends AutoFormControl<infer C>
          ? { component: C, props: ComponentProps<C>, slots: ComponentSlots<C> }
          : never
        : never
      : TZodType extends keyof TControls
        ? TControls[TZodType] extends AutoFormControl<infer C>
          ? { component: C, props: ComponentProps<C>, slots: ComponentSlots<C> }
          : never
        : { component: never, props: object, slots: object }

// 类型化的 AutoForm Meta 接口
export interface TypedAutoFormMeta<TControls, TZodType> extends GlobalMeta {
  /** 第一优先级：直接组件指定 */
  component?: any

  /** 第二优先级：类型映射，智能提示合法键名 */
  type?: keyof TControls

  /** 智能推导的 Props - 基于三级优先级系统 */
  controlProps?: ResolveControlType<this, TControls, TZodType> extends { props: infer P } ? P : object

  /** 智能推导的 Slots - 基于三级优先级系统 */
  controlSlots?: ResolveControlType<this, TControls, TZodType> extends { slots: infer S } ? S : object
}

// AutoFormControl 类型定义
export interface AutoFormControl<C extends IsComponent> {
  component: C
  props?: ComponentProps<C>
  slots?: ComponentSlots<C>
}

export type AutoFormControls = Record<string, AutoFormControl<IsComponent>>

export {}
