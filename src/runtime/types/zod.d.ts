import type { AutoFormFieldContext, AutoFormFieldSlots, AutoFormNestedCollapsible } from '#movk/types/auto-form'
import type { ClassNameValue } from 'tailwind-merge'
import type { ReactiveValue } from '@movk/core'

type ZodValue<T, CTX = AutoFormFieldContext> = ReactiveValue<T, CTX>

export interface ZodAutoFormFieldMeta {
  /**
   * The element or component this component should render as.
   * @defaultValue 'div'
   */
  as?: ZodValue<any>
  /** The name of the FormField. Also used to match form errors. */
  name?: ZodValue<string>
  /** A regular expression to match form error names. */
  errorPattern?: ZodValue<RegExp>
  label?: ZodValue<string>
  description?: ZodValue<string>
  help?: ZodValue<string>
  error?: ZodValue<boolean | string>
  hint?: ZodValue<string>
  /**
   * @defaultValue 'md'
   */
  size?: ZodValue<'md' | 'xs' | 'sm' | 'lg' | 'xl'>
  /**
   * @defaultValue true
   */
  required?: ZodValue<boolean>
  /** If true, validation on input will be active immediately instead of waiting for a blur event. */
  eagerValidation?: ZodValue<boolean>
  /**
   * Delay in milliseconds before validating the form on input events.
   * @defaultValue `300`
   */
  validateOnInputDelay?: ZodValue<number>
  class?: ZodValue<any>
  ui?: ZodValue<{ root?: ClassNameValue, wrapper?: ClassNameValue, labelWrapper?: ClassNameValue, label?: strClassNameValueing, container?: ClassNameValue, description?: ClassNameValue, error?: ClassNameValue, hint?: ClassNameValue, help?: ClassNameValue }>
  /**
   * @see https://ui4.nuxt.com/docs/components/form-field#slots
   */
  fieldSlots?: ZodValue<Partial<AutoFormFieldSlots>>

  /** 显示条件 */
  if?: ZodValue<boolean>
  /** 是否隐藏 */
  hidden?: ZodValue<boolean>
  /**
   * object field
   */
  collapsible?: ZodValue<AutoFormNestedCollapsible>

  /** 索引签名，允许动态属性访问 */
  [key: string]: unknown
}

declare module 'zod/v4' {

  interface GlobalMeta extends ZodAutoFormFieldMeta { }

}

export { }
