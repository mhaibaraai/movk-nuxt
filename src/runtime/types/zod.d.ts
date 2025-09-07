import type { FormFieldSlots } from '@nuxt/ui'
import type { ComponentProps, ComponentSlots, IsComponent } from '../core'

declare module 'zod/v4' {
  interface GlobalMeta<C extends IsComponent = IsComponent> {
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
     * FormFieldSlots
     * @see https://ui4.nuxt.com/docs/components/form-field#slots
     */
    fieldSlots?: FormFieldSlots

    type?: string
    component?: C
    controlProps?: ComponentProps<C>
    controlSlots?: ComponentSlots<C>
  }
}

export {}
