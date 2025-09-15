<script setup lang="ts" generic="S extends z.ZodObject, T extends boolean = true">
import type { AnyObject } from '@movk/core'
import type { FormData, FormError, FormErrorEvent, FormFieldSlots, FormInputEvents, FormSubmitEvent, InferInput } from '@nuxt/ui'
import type { z } from 'zod/v4'
import type { AutoFormControls } from '../../types'
import defu from 'defu'
import { computed, Fragment, h, isVNode, resolveDynamicComponent, watch } from 'vue'
import { DEFAULT_CONTROLS } from '../../constants/auto-form'
import { deepClone, getPath, setPath } from '../../core'
import { introspectSchema, resolveControl } from '../../utils/auto-form'

export interface AutoFormProps<S extends z.ZodObject, T extends boolean = true> {
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
  size?: 'md' | 'xs' | 'sm' | 'lg' | 'xl'
}

export interface AutoFormEmits<S extends z.ZodObject, T extends boolean = true> {
  submit: [event: FormSubmitEvent<FormData<S, T>>]
  error: [event: FormErrorEvent]
}

export interface AutoFormSlots extends FormFieldSlots {
  'before-fields': (props: { fields: any[], state: any }) => any
  'after-fields': (props: { fields: any[], state: any }) => any
  [key: string]: ((props: any) => any) | undefined
}

type FormStateType = InferInput<S>

const { schema, controls, size, ...props } = defineProps<AutoFormProps<S, T>>()
const emit = defineEmits<AutoFormEmits<S, T>>()
const _slots = defineSlots<AutoFormSlots>()

const state = defineModel<FormStateType>({ default: () => ({} as FormStateType) })

type Field = ReturnType<typeof useFieldTree>['fields']['value'][number]

function useFieldTree(schema: S | undefined, controls: AutoFormControls = {}) {
  const fields = computed(() => {
    if (!schema)
      return [] as any[]
    const mapping = defu(controls, DEFAULT_CONTROLS)
    const entries = introspectSchema(schema)
    console.log(entries)
    return entries.map((entry) => {
      return {
        path: entry.path,
        schema: entry.schema,
        zodType: entry.zodType,
        meta: entry.meta,
        decorators: entry.decorators,
        control: resolveControl(entry, mapping),
      }
    }).filter(field => field.control?.if !== false)
  })
  return {
    fields,
  }
}

const { fields } = useFieldTree(schema, controls)

watch(
  () => fields.value.length,
  (next, prev) => {
    if (next > 0 && (prev === 0 || prev === undefined) && schema) {
      initializeDefaultValues(fields.value, state.value)
    }
  },
  { immediate: true },
)

function buildSlotProps(field: Field) {
  return {
    state,
    zodType: field.zodType,
    meta: field.meta,
    path: field.path,
    schema: field.schema,
    value: getPath(state.value, field.path),
    setValue: (v: any) => setPath(state.value, field.path, v),
  }
}

function initializeDefaultValues(fields: Field[], stateValue: any) {
  for (const field of fields) {
    if (field.decorators?.defaultValue !== undefined) {
      const currentValue = getPath(stateValue, field.path)
      if (currentValue === undefined) {
        setPath(stateValue, field.path, deepClone(field.decorators.defaultValue))
      }
    }
  }
}

function enhanceEventProps(originalProps: AnyObject, ctx: any) {
  const next: Record<string, any> = {}
  for (const key of Object.keys(originalProps || {})) {
    const val = (originalProps as any)[key]
    if (/^on[A-Z].+/.test(key) && typeof val === 'function') {
      next[key] = (...args: any[]) => (val as any)(...args, ctx)
    }
    else {
      next[key] = val
    }
  }
  return next
}

function renderControl(field: Field) {
  const control = field?.control
  const comp = control?.component as any
  if (!comp) {
    return h('div', { class: 'text-red-500' }, `[AutoForm] 控件未映射: ${field?.path ?? ''}`)
  }
  if (isVNode(comp))
    return comp
  const component = resolveDynamicComponent(comp)
  if (control?.props) {
    for (const key of Object.keys(control.props)) {
      if (/^on[A-Z].+/.test(key) && typeof (control.props as any)[key] !== 'function')
        console.warn(`[AutoForm] 事件属性应为函数: ${key} @ ${field.path}`)
    }
  }
  const originalProps = (control?.props || {}) as Record<string, any>
  const userOnUpdate = (originalProps as any)['onUpdate:modelValue']
  const rest = { ...originalProps }
  delete (rest as any)['onUpdate:modelValue']
  const ctx = buildSlotProps(field)
  const wrapped = enhanceEventProps(rest, ctx)
  return h(
    component as any,
    {
      ...wrapped,
      'onUpdate:modelValue': (v: any) => {
        setPath(state.value as any, field.path, v)
        if (typeof userOnUpdate === 'function')
          userOnUpdate(v, ctx)
      },
      'modelValue': getPath(state.value as any, field.path),
    },
    control?.slots as any,
  )
}

function renderFieldSlot(fn?: (props?: any) => any, slotProps?: any) {
  return fn ? (fn as any)(slotProps) : null
}

function hasNamedSlot(field: Field, name: keyof FormFieldSlots) {
  const keySpecific = `${name}:${field.path}`
  const s = _slots as any
  return Boolean(field.meta?.fieldSlots?.[name] || s?.[keySpecific] || s?.[name])
}

function normalize(node: any): any[] {
  if (node == null || node === false)
    return []

  if (Array.isArray(node))
    return node.flatMap(n => normalize(n))

  if (isVNode(node))
    return [node]

  const t = typeof node
  if (t === 'string' || t === 'number')
    return [node]

  // 其它对象不参与字符串化，避免触发 JSON.stringify 循环
  return []
}

function VNodeRender(props: { node: unknown }) {
  const children = normalize(props.node as any)
  if (children.length === 0)
    return null as any
  if (children.length === 1)
    return children[0] as any
  return h(Fragment, null, children)
}
</script>

<template>
  <UForm :state="state" :schema="schema" v-bind="props" @submit="emit('submit', $event)" @error="emit('error', $event)">
    <slot name="before-fields" :fields="fields" :state="state" />
    <template v-for="field in fields" :key="field.path">
      <Transition>
        <UFormField
          v-show="field.control?.show !== false"
          :as="field.meta?.as"
          :name="field.path"
          :error-pattern="field.meta?.errorPattern"
          :label="field.meta?.label"
          :description="field.meta?.description"
          :help="field.meta?.help"
          :hint="field.meta?.hint"
          :size="field.meta?.size ?? size"
          :required="field.meta?.required"
          :eager-validation="field.meta?.eagerValidation"
          :validate-on-input-delay="field.meta?.validateOnInputDelay"
          :class="field.meta?.class"
          :ui="field.meta?.ui"
        >
          <template v-if="hasNamedSlot(field, 'label')" #label="{ label }">
            <slot :name="`label:${field.path}`" v-bind="{ label, ...buildSlotProps(field) }">
              <slot name="label" v-bind="{ label, ...buildSlotProps(field) }">
                <VNodeRender
                  :node="renderFieldSlot(field.meta?.fieldSlots?.label, { label, ...buildSlotProps(field) })"
                />
              </slot>
            </slot>
          </template>
          <template v-if="hasNamedSlot(field, 'hint')" #hint="{ hint }">
            <slot :name="`hint:${field.path}`" v-bind="{ hint, ...buildSlotProps(field) }">
              <slot name="hint" v-bind="{ hint, ...buildSlotProps(field) }">
                <VNodeRender :node="renderFieldSlot(field.meta?.fieldSlots?.hint, { hint, ...buildSlotProps(field) })" />
              </slot>
            </slot>
          </template>
          <template v-if="hasNamedSlot(field, 'description')" #description="{ description }">
            <slot :name="`description:${field.path}`" v-bind="{ description, ...buildSlotProps(field) }">
              <slot name="description" v-bind="{ description, ...buildSlotProps(field) }">
                <VNodeRender
                  :node="renderFieldSlot(field.meta?.fieldSlots?.description, { description, ...buildSlotProps(field) })"
                />
              </slot>
            </slot>
          </template>
          <template v-if="hasNamedSlot(field, 'help')" #help="{ help }">
            <slot :name="`help:${field.path}`" v-bind="{ help, ...buildSlotProps(field) }">
              <slot name="help" v-bind="{ help, ...buildSlotProps(field) }">
                <VNodeRender :node="renderFieldSlot(field.meta?.fieldSlots?.help, { help, ...buildSlotProps(field) })" />
              </slot>
            </slot>
          </template>
          <template v-if="hasNamedSlot(field, 'error')" #error="{ error }">
            <slot :name="`error:${field.path}`" v-bind="{ error, ...buildSlotProps(field) }">
              <slot name="error" v-bind="{ error, ...buildSlotProps(field) }">
                <VNodeRender
                  :node="renderFieldSlot(field.meta?.fieldSlots?.error, { error, ...buildSlotProps(field) })"
                />
              </slot>
            </slot>
          </template>
          <template #default="{ error }">
            <slot :name="`default:${field.path}`" v-bind="{ error, ...buildSlotProps(field) }">
              <slot name="default" v-bind="{ error, ...buildSlotProps(field) }">
                <VNodeRender
                  :node="renderFieldSlot(field.meta?.fieldSlots?.default, { error, ...buildSlotProps(field) })"
                />
                <template v-if="!field.meta?.fieldSlots || !field.meta?.fieldSlots.default">
                  <VNodeRender :node="renderControl(field)" />
                </template>
              </slot>
            </slot>
          </template>
        </UFormField>
      </Transition>
    </template>
    <slot name="after-fields" :fields="fields" :state="state" />
    <!-- <slot name="submit" :state="state" /> -->
  </UForm>
</template>
