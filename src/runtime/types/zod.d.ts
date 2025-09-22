import type { AutoFormFieldContext } from '#movk/types/auto-form'
import type { FormFieldSlots } from '@nuxt/ui'
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
    name?: string
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
    ui?: ReactiveValue<{ root?: string, wrapper?: string, labelWrapper?: string, label?: string, container?: string, description?: string, error?: string, hint?: string, help?: string }>
    /**
     * @see https://ui4.nuxt.com/docs/components/form-field#slots
     */
    slots?: ReactiveValue<Partial<FormFieldSlots>>

    /** 是否隐藏 */
    hidden?: ReactiveValue<boolean>
    /** 显示条件 */
    if?: ReactiveValue<boolean>
  }
}

export { }
