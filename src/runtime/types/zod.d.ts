import type { AutoFormFieldContext, AutoFormFieldSlots, AutoFormNestedCollapsible } from '#movk/types/auto-form'
import type { ClassNameValue } from 'tailwind-merge'
import type { ComputedRef, Ref } from 'vue'

type ReactiveValue<T, CTX = AutoFormFieldContext> = T | ((ctx: CTX) => T) | Ref<T> | ComputedRef<T>

declare module 'zod/v4' {
  interface GlobalMeta extends GlobalAutoFormMeta { }
  interface GlobalAutoFormMeta {
    /**
     * The element or component this component should render as.
     * @defaultValue 'div'
     */
    as?: ReactiveValue<any>
    /** The name of the FormField. Also used to match form errors. */
    name?: ReactiveValue<string>
    /** A regular expression to match form error names. */
    errorPattern?: ReactiveValue<RegExp>
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
    eagerValidation?: ReactiveValue<boolean>
    /**
     * Delay in milliseconds before validating the form on input events.
     * @defaultValue `300`
     */
    validateOnInputDelay?: ReactiveValue<number>
    class?: ReactiveValue<any>
    ui?: ReactiveValue<{ root?: ClassNameValue, wrapper?: ClassNameValue, labelWrapper?: ClassNameValue, label?: strClassNameValueing, container?: ClassNameValue, description?: ClassNameValue, error?: ClassNameValue, hint?: ClassNameValue, help?: ClassNameValue }>
    /**
     * @see https://ui4.nuxt.com/docs/components/form-field#slots
     */
    fieldSlots?: ReactiveValue<Partial<AutoFormFieldSlots>>

    /** 是否隐藏 */
    hidden?: ReactiveValue<boolean>
    /** 显示条件 */
    if?: ReactiveValue<boolean>
    /**
     * object field
     */
    collapsible?: ReactiveValue<AutoFormNestedCollapsible>
  }
}

export { }
