<script lang="ts">
import type { FormData, FormError, FormErrorEvent, FormInputEvents, FormSubmitEvent, InferInput } from '@nuxt/ui'
import type { GlobalMeta, z } from 'zod/v4'
import type { ComponentProps, ComponentSlots, IsComponent } from '../../core'
import type { AutoFormControl, AutoFormControls } from '../../types'
import { UInput, UInputNumber, USelect, USwitch } from '#components'
import { isFunction } from '@movk/core'
import defu from 'defu'
import { h, isVNode, resolveDynamicComponent } from 'vue'
import { getPath, setPath } from '../../core'
import { introspectSchema, resolveControl } from '../../utils/auto-form'

export interface AutoFormProps {
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
   * Delay in milliseconds before validating the form on input events.
   * @defaultValue `300`
   */
  validateOnInputDelay?: number
  /**
   * If true, schema transformations will be applied to the state on submit.
   * @defaultValue `true`
   */
  transform?: T

  /**
   * If true, this form will attach to its parent Form (if any) and validate at the same time.
   * @defaultValue `true`
   */
  attach?: boolean

  /**
   * When `true`, all form elements will be disabled on `@submit` event.
   * This will cause any focused input elements to lose their focus state.
   * @defaultValue `true`
   */
  loadingAuto?: boolean
  class?: any
  onSubmit?: ((event: FormSubmitEvent<FormData<S, T>>) => void | Promise<void>) | (() => void | Promise<void>)
  controls?: AutoFormControls
}

export interface AutoFormEmits {
  submit: [event: FormSubmitEvent<FormData<S, T>>]
  error: [event: FormErrorEvent]
}

export function createControl<T extends IsComponent>(e: {
  component: T
  props?: ComponentProps<T>
  slots?: ComponentSlots<T>
}): AutoFormControl<T> {
  return { component: e.component, props: e.props, slots: e.slots }
}

export function afMeta<C extends IsComponent>(component: C, meta?: Omit<GlobalMeta<C>, 'component'>): GlobalMeta<C> {
  return {
    component,
    ...(meta || {} as any),
  }
}
</script>

<script setup lang="ts" generic="S extends z.ZodType, T extends boolean = true">
const { schema, controls, ...props } = defineProps<AutoFormProps>()
const emit = defineEmits<AutoFormEmits>()

const state = defineModel<Partial<InferInput<S>>>({ default: {} })

const defaultControls = {
  string: createControl({ component: UInput, props: { ui: { root: 'text-red-500' } } }),
  number: createControl({ component: UInputNumber }),
  boolean: createControl({ component: USwitch }),
  enum: createControl({ component: USelect }),
} satisfies AutoFormControls

function useFieldTree(schema: S | undefined, controls: AutoFormControls = {}) {
  if (!schema) {
    return {
      fields: [],
    }
  }
  const mapping = defu(controls, defaultControls)
  const entries = introspectSchema(schema)
  const fields = entries.map((entry) => {
    console.log('entry', entry)
    const meta = isFunction(entry.meta) ? entry.meta() : entry.meta || {}
    return {
      path: entry.path,
      schema: entry.schema,
      zodType: entry.zodType,
      meta,
      control: resolveControl(entry, mapping),
    }
  })
  console.log('entries', entries)
  return {
    fields,
  }
}

const { fields } = useFieldTree(schema, controls)

// function makeFieldSlotCtx(slotProps: any, field: any) {
//   const set = (v: any) => setPath(state as any, field.path, v)
//   return {
//     path: field.path,
//     value: getPath(state as any, field.path),
//     update: set,
//     setValue: set,
//     error: slotProps?.error,
//     label: field.meta?.label,
//     hint: field.meta?.hint,
//     description: field.meta?.description,
//     help: field.meta?.help,
//     required: field.meta?.required,
//     size: field.meta?.size,
//     schema: field.schema,
//     meta: field.meta,
//     zodType: field.zodType,
//   }
// }

// function wrapSlots(fns: Record<string, (props?: any) => any> | undefined, makeCtx: (p?: any) => any) {
//   if (!fns)
//     return undefined as any
//   const out: Record<string, (p?: any) => any> = {}
//   for (const key of Object.keys(fns)) {
//     const fn = (fns as any)[key]
//     if (typeof fn === 'function')
//       out[key] = (p?: any) => fn(makeCtx(p))
//   }
//   return out
// }

// function buildControlSlots(field: any) {
//   return wrapSlots(field.control?.slots as any, (p?: any) => makeFieldSlotCtx(p, field))
// }

// function renderControl(field: any) {
//   const comp = field.control.component as any
//   if (isVNode(comp))
//     return comp
//   const component = resolveDynamicComponent(comp)
//   if (import.meta.dev && field?.control?.props) {
//     for (const key of Object.keys(field.control.props)) {
//       if (/^on[A-Z].+/.test(key) && typeof (field.control.props as any)[key] !== 'function')
//         console.warn(`[AutoForm] 事件属性应为函数: ${key} @ ${field.path}`)
//     }
//   }
//   return h(
//     component as any,
//     {
//       'modelValue': getPath(state as any, field.path),
//       ...(field.control.props || {}),
//       'ui': field.control.ui,
//       'onUpdate:modelValue': (v: any) => setPath(state as any, field.path, v),
//     },
//     buildControlSlots(field),
//   )
// }

// function buildFieldSlots(field: any) {
//   const fs = (field.meta?.fieldSlots || {}) as Record<string, (props?: any) => any>
//   const out = wrapSlots(fs, (p?: any) => makeFieldSlotCtx(p, field)) || {}
//   if (typeof fs.default !== 'function')
//     out.default = () => renderControl(field)
//   return out
// }
</script>

<template>
  <UForm :state="state" :schema="schema" v-bind="props" @submit="emit('submit', $event)" @error="emit('error', $event)">
    <slot name="before-fields" :fields="fields" :state="state" />
    <!-- <template v-for="field in fields" :key="field.path">
      <UFormField
        v-slots="buildFieldSlots(field)"
        :as="field.meta?.as"
        :name="field.path"
        :error-pattern="field.meta?.error"
        :label="field.meta?.label"
        :description="field.meta?.description"
        :help="field.meta?.help"
        :hint="field.meta?.hint"
        :size="field.meta?.size"
        :required="field.meta?.required"
        :eager-validation="field.meta?.eagerValidation"
        :validate-on-input-delay="field.meta?.validateOnInputDelay"
        :class="field.meta?.class"
        :ui="field.meta?.ui"
      />
    </template> -->
    <slot name="after-fields" :fields="fields" :state="state" />
  </UForm>
</template>
