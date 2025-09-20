<script setup lang="ts" generic="S extends z.ZodObject, T extends boolean = true, N extends boolean = false">
import type { FormData, FormError, FormErrorEvent, FormInputEvents, FormSubmitEvent, InferInput } from '@nuxt/ui'
import type { z } from 'zod/v4'
import type { AutoFormControls, AutoFormField, AutoFormFieldContext, DynamicFormSlots } from '../../types/auto-form'
import defu from 'defu'
import { computed, h, isVNode, resolveDynamicComponent, unref, watch } from 'vue'
import { DEFAULT_CONTROLS } from '../../constants/auto-form'
import { deepClone, getPath, setPath } from '../../core'
import { enhanceEventProps, introspectSchema, resolveReactiveValue, VNodeRender } from '../../utils/auto-form'

export interface AutoFormProps<S extends z.ZodObject, T extends boolean = true, N extends boolean = false> {
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
   * Path of the form's state within it's parent form.
   * Used for nesting forms. Only available if `nested` is true.
   */
  name?: N extends true ? string : never

  /**
   * Delay in milliseconds before validating the form on input events.
   * @defaultValue `300`
   */
  validateOnInputDelay?: number
  /**
   * If true, applies schema transformations on submit.
   * @defaultValue `true`
   */
  transform?: T

  /**
   * If true, this form will attach to its parent Form and validate at the same time.
   * @defaultValue `false`
   */
  nested?: N

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
  /**
   * Enable transition animation for field changes.
   * @defaultValue `true`
   */
  enableTransition?: boolean
}

export interface AutoFormEmits<S extends z.ZodObject, T extends boolean = true> {
  submit: [event: FormSubmitEvent<FormData<S, T>>]
  error: [event: FormErrorEvent]
}

export type AutoFormSlots<T extends object> = {
  'before-fields': (props: { fields: AutoFormField[], state: T }) => any
  'after-fields': (props: { fields: AutoFormField[], state: T }) => any
} & DynamicFormSlots<T>

type AutoFormStateType = N extends false ? Partial<InferInput<S>> : never
const {
  schema,
  controls,
  size,
  enableTransition = true,
  ...restProps
} = defineProps<AutoFormProps<S, T, N>>()
const emit = defineEmits<AutoFormEmits<S, T>>()
const _slots = defineSlots<AutoFormSlots<AutoFormStateType>>()

const state = defineModel<AutoFormStateType>({ default: () => ({}) })

// 简化 fields 计算属性 - 仅处理静态结构
const fields = computed(() => {
  if (!schema)
    return []

  const resolvedSchema = unref(schema)
  const mapping = {
    ...DEFAULT_CONTROLS,
    ...controls,
  }
  const entries = introspectSchema(resolvedSchema, mapping)
  return entries
})

// 仅保留必要的字段上下文缓存
const fieldContextCache = new Map<string, AutoFormFieldContext>()

// 简化的字段上下文创建
function createFieldContext(field: AutoFormField): AutoFormFieldContext {
  const path = field.path
  if (!fieldContextCache.has(path)) {
    fieldContextCache.set(path, {
      get state() { return state.value as AutoFormStateType },
      path,
      get value() { return getPath(state.value, path) as AutoFormStateType[keyof AutoFormStateType] },
      setValue: (v: AutoFormStateType[keyof AutoFormStateType]) => setPath(state.value, path, v),
    })
  }
  return fieldContextCache.get(path)!
}

// 监听 schema 变化，清理缓存
watch(() => unref(schema), () => {
  fieldContextCache.clear()
}, { deep: false })

const visibleFields = computed(() => fields.value.filter((field: AutoFormField) => {
  const hasIfCondition = field.meta?.if !== undefined || field.meta.mapped?.if !== undefined
  const ifValue = resolveFieldProp(field, 'if', field.meta.mapped?.if)

  if (!hasIfCondition)
    return true
  return ifValue === true
}))

// 优化默认值初始化 - 减少副作用
watch(
  fields,
  (newFields) => {
    if (newFields.length > 0) {
      for (const field of newFields) {
        if (field.decorators?.defaultValue !== undefined) {
          const currentValue = getPath(state.value, field.path)
          if (currentValue === undefined) {
            setPath(state.value, field.path, deepClone(field.decorators.defaultValue))
          }
        }
      }
    }
  },
  { immediate: true },
)

// 辅助函数：解析字段属性并返回正确类型
function resolveFieldProp<T = any>(field: AutoFormField, prop: string, defaultValue?: T): T | undefined {
  const value = field.meta?.[prop]
  if (value === undefined)
    return defaultValue
  const context = createFieldContext(field)
  const resolved = resolveReactiveValue(value, context)

  return resolved
}

// 简化后的渲染控件 - 无缓存
function renderControl(field: AutoFormField) {
  const controlMeta = field?.meta
  const comp = controlMeta?.component as any
  if (!comp) {
    return h('div', { class: 'text-red-500' }, `[AutoForm] 控件未映射: ${field?.path ?? ''}`)
  }
  if (isVNode(comp))
    return comp

  const component = typeof comp === 'string' ? resolveDynamicComponent(comp) : comp
  const context = createFieldContext(field)

  const props = defu(controlMeta.controlProps ? resolveReactiveValue(controlMeta.controlProps, context) : {}, controlMeta?.mapped?.controlProps)
  const slots = defu(controlMeta.controlSlots ? resolveReactiveValue(controlMeta.controlSlots, context) : {}, controlMeta?.mapped?.controlSlots)

  const userOnUpdate = props['onUpdate:modelValue']
  const rest = { ...props }
  delete rest['onUpdate:modelValue']

  const slotProps = createFieldContext(field)
  const wrapped = enhanceEventProps(rest, slotProps)

  return h(
    component as any,
    {
      ...wrapped,
      'onUpdate:modelValue': (v: AutoFormStateType[keyof AutoFormStateType]) => {
        context.setValue(v)
        if (typeof userOnUpdate === 'function')
          userOnUpdate(v, slotProps)
      },
      'modelValue': context.value,
    },
    slots,
  )
}

function renderFieldSlot(fn?: (props?: any) => any, slotProps?: any) {
  return fn ? (fn as any)(slotProps) : null
}

// 辅助函数：获取解析后的 fieldSlots
function getResolvedFieldSlots(field: AutoFormField) {
  if (!field.meta?.fieldSlots)
    return undefined
  const context = createFieldContext(field)
  return resolveReactiveValue(field.meta.fieldSlots, context)
}

function hasNamedSlot(field: AutoFormField, name: keyof AutoFormSlots<AutoFormStateType>) {
  const keySpecific = `${name}:${field.path}`
  const s = _slots as any
  const fieldSlots = getResolvedFieldSlots(field)
  return Boolean(fieldSlots?.[name] || s?.[keySpecific] || s?.[name])
}
</script>

<template>
  <UForm
    :state="state"
    :schema="unref(schema)"
    v-bind="restProps"
    @submit="emit('submit', $event)"
    @error="emit('error', $event)"
  >
    <slot name="before-fields" :fields="visibleFields" :state="state" />
    <TransitionGroup :name="enableTransition ? 'auto-form-field' : ''" :duration="{ enter: 350, leave: 250 }">
      <template v-for="field in visibleFields" :key="field.path">
        <UFormField
          v-show="!resolveFieldProp(field, 'hidden', field.meta?.mapped?.hidden)"
          :name="field.path"
          :as="resolveFieldProp(field, 'as')"
          :error-pattern="resolveFieldProp(field, 'errorPattern')"
          :label="resolveFieldProp(field, 'label')"
          :description="resolveFieldProp(field, 'description')"
          :help="resolveFieldProp(field, 'help')"
          :hint="resolveFieldProp(field, 'hint')"
          :size="resolveFieldProp(field, 'size', size)"
          :required="resolveFieldProp(field, 'required')"
          :eager-validation="resolveFieldProp(field, 'eagerValidation')"
          :validate-on-input-delay="resolveFieldProp(field, 'validateOnInputDelay')"
          :class="resolveFieldProp(field, 'class')"
          :ui="resolveFieldProp(field, 'ui')"
        >
          <template v-if="hasNamedSlot(field, 'label')" #label="{ label }">
            <slot
              :name="`label:${field.path}`"
              v-bind="{ label: label || resolveFieldProp(field, 'label'), ...createFieldContext(field) }"
            >
              <slot
                name="label"
                v-bind="{ label: label || resolveFieldProp(field, 'label'), ...createFieldContext(field) }"
              >
                <VNodeRender
                  :node="renderFieldSlot(getResolvedFieldSlots(field)?.label, { label: label || resolveFieldProp(field, 'label'), ...createFieldContext(field) })"
                />
              </slot>
            </slot>
          </template>
          <template v-if="hasNamedSlot(field, 'hint')" #hint="{ hint }">
            <slot
              :name="`hint:${field.path}`"
              v-bind="{ hint: hint || resolveFieldProp(field, 'hint'), ...createFieldContext(field) }"
            >
              <slot
                name="hint"
                v-bind="{ hint: hint || resolveFieldProp(field, 'hint'), ...createFieldContext(field) }"
              >
                <VNodeRender
                  :node="renderFieldSlot(getResolvedFieldSlots(field)?.hint, { hint: hint || resolveFieldProp(field, 'hint'), ...createFieldContext(field) })"
                />
              </slot>
            </slot>
          </template>
          <template v-if="hasNamedSlot(field, 'description')" #description="{ description }">
            <slot
              :name="`description:${field.path}`"
              v-bind="{ description: description || resolveFieldProp(field, 'description'), ...createFieldContext(field) }"
            >
              <slot
                name="description"
                v-bind="{ description: description || resolveFieldProp(field, 'description'), ...createFieldContext(field) }"
              >
                <VNodeRender
                  :node="renderFieldSlot(getResolvedFieldSlots(field)?.description, { description: description || resolveFieldProp(field, 'description'), ...createFieldContext(field) })"
                />
              </slot>
            </slot>
          </template>
          <template v-if="hasNamedSlot(field, 'help')" #help="{ help }">
            <slot
              :name="`help:${field.path}`"
              v-bind="{ help: help || resolveFieldProp(field, 'help'), ...createFieldContext(field) }"
            >
              <slot
                name="help"
                v-bind="{ help: help || resolveFieldProp(field, 'help'), ...createFieldContext(field) }"
              >
                <VNodeRender
                  :node="renderFieldSlot(getResolvedFieldSlots(field)?.help, { help: help || resolveFieldProp(field, 'help'), ...createFieldContext(field) })"
                />
              </slot>
            </slot>
          </template>
          <template v-if="hasNamedSlot(field, 'error')" #error="{ error }">
            <slot :name="`error:${field.path}`" v-bind="{ error, ...createFieldContext(field) }">
              <slot name="error" v-bind="{ error, ...createFieldContext(field) }">
                <VNodeRender
                  :node="renderFieldSlot(getResolvedFieldSlots(field)?.error, { error, ...createFieldContext(field) })"
                />
              </slot>
            </slot>
          </template>
          <template #default="{ error }">
            <slot :name="`default:${field.path}`" v-bind="{ error, ...createFieldContext(field) }">
              <slot name="default" v-bind="{ error, ...createFieldContext(field) }">
                <VNodeRender
                  :node="renderFieldSlot(getResolvedFieldSlots(field)?.default, { error, ...createFieldContext(field) })"
                />
                <template v-if="!field.meta?.fieldSlots || !getResolvedFieldSlots(field)?.default">
                  <VNodeRender :node="renderControl(field)" />
                </template>
              </slot>
            </slot>
          </template>
        </UFormField>
      </template>
    </TransitionGroup>
    <slot name="after-fields" :fields="visibleFields" :state="state" />
    <!-- <slot name="submit" :state="state" /> -->
  </UForm>
</template>
