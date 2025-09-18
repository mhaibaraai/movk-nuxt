import type { ReactiveValue } from '#movk/types'
import type { FormFieldSlots } from '@nuxt/ui'

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
    size?: 'md' | 'xs' | 'sm' | 'lg' | 'xl'
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
    ui?: { root?: string, wrapper?: string, labelWrapper?: string, label?: string, container?: string, description?: string, error?: string, hint?: string, help?: string }
    /**
     * @see https://ui4.nuxt.com/docs/components/form-field#slots
     */
    fieldSlots?: Partial<FormFieldSlots>
  }
}

export { }
