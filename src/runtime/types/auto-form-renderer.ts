import type { z } from 'zod/v4'
import type { AnyObject } from '@movk/core'
import type { ButtonProps } from '@nuxt/ui'
import type { AutoFormField } from './auto-form'
import type { AutoFormProps } from '../components/AutoForm.vue'

export interface AutoFormRendererArrayProps<S extends z.ZodObject> extends Pick<AutoFormProps<S>, 'schema'> {
  field: AutoFormField
  extraProps?: AnyObject
  addButtonProps?: Partial<ButtonProps>
}

export interface AutoFormFieldProps<S extends z.ZodObject> extends Pick<AutoFormProps<S>, 'schema'> {
  field: AutoFormField
  extraProps?: AnyObject
}

export interface AutoFormRendererLayoutProps<S extends z.ZodObject> extends Pick<AutoFormProps<S>, 'schema'> {
  field: AutoFormField
  extraProps?: AnyObject
}

export interface AutoFormRendererNestedProps<S extends z.ZodObject> extends Pick<AutoFormProps<S>, 'schema'> {
  field: AutoFormField
  extraProps?: AnyObject
}
