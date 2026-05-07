import type { AutoFormFieldContext, AutoFormFieldSlots, AutoFormNestedCollapsible } from './auto-form/fields'
import type { ClassNameValue } from './shared'
import type { ReactiveValue } from '@movk/core'

type ZodValue<T, CTX = AutoFormFieldContext> = ReactiveValue<T, CTX>

export interface ZodAutoFormFieldMeta {
  /**
   * 当前字段渲染使用的元素或组件。
   * @defaultValue 'div'
   */
  as?: ZodValue<any>
  /** 表单字段名，同时用于匹配表单错误。 */
  name?: ZodValue<string>
  /** 用于匹配表单错误名称的正则表达式。 */
  errorPattern?: ZodValue<RegExp>
  label?: ZodValue<string>
  description?: ZodValue<string>
  help?: ZodValue<string>
  error?: ZodValue<boolean | string>
  hint?: ZodValue<string>
  /**
   * 字段尺寸。
   * @defaultValue 'md'
   */
  size?: ZodValue<'md' | 'xs' | 'sm' | 'lg' | 'xl'>
  /**
   * 是否必填。
   * @defaultValue true
   */
  required?: ZodValue<boolean>
  /** 是否在输入时立即触发校验（而不是等待 blur 事件）。 */
  eagerValidation?: ZodValue<boolean>
  /**
   * 输入事件触发后，延迟多少毫秒执行表单校验。
   * @defaultValue `300`
   */
  validateOnInputDelay?: ZodValue<number>
  class?: ZodValue<any>
  ui?: ZodValue<{ root?: ClassNameValue, wrapper?: ClassNameValue, labelWrapper?: ClassNameValue, label?: ClassNameValue, container?: ClassNameValue, description?: ClassNameValue, error?: ClassNameValue, hint?: ClassNameValue, help?: ClassNameValue }>
  /**
   * @see https://ui4.nuxt.com/docs/components/form-field#slots
   */
  fieldSlots?: ZodValue<Partial<AutoFormFieldSlots>>

  /** 显示条件 */
  if?: ZodValue<boolean>
  /** 是否隐藏 */
  hidden?: ZodValue<boolean>
  /**
   * 对象字段折叠配置。
   */
  collapsible?: ZodValue<AutoFormNestedCollapsible>

  /** 索引签名，允许动态属性访问 */
  [key: string]: unknown
}

declare module 'zod' {
  interface GlobalMeta extends ZodAutoFormFieldMeta { }
}

export { }
