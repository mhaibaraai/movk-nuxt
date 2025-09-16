<script setup lang="ts" generic="S extends z.ZodObject, T extends boolean = true">
import type { AnyObject } from '@movk/core'
import type { FormData, FormError, FormErrorEvent, FormFieldSlots, FormInputEvents, FormSubmitEvent, InferInput } from '@nuxt/ui'
import type { z } from 'zod/v4'
import type { AutoFormControls, FieldContext, ReactiveValue } from '../../types'
import { computedEager } from '@vueuse/core'
import defu from 'defu'
import { Fragment, h, isRef, isVNode, markRaw, resolveDynamicComponent, unref, watch } from 'vue'
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

const { schema, controls, size, ...restProps } = defineProps<AutoFormProps<S, T>>()
const emit = defineEmits<AutoFormEmits<S, T>>()
const _slots = defineSlots<AutoFormSlots>()

const state = defineModel<FormStateType>({ default: () => ({} as FormStateType) })

// 仅保留必要的字段上下文缓存
const fieldContextCache = new Map<string, FieldContext>()

// 简化的字段上下文创建
function createFieldContext(path: string): FieldContext {
  if (!fieldContextCache.has(path)) {
    fieldContextCache.set(path, {
      get state() { return state.value },
      path,
      get value() { return getPath(state.value, path) },
      setValue: (v: any) => setPath(state.value, path, v),
    })
  }
  return fieldContextCache.get(path)!
}

// 监听 schema 变化，清理缓存
watch(() => unref(schema), () => {
  fieldContextCache.clear()
}, { deep: false })

// 响应式值解析函数 - 直接解析，不缓存
function resolveReactiveValue(value: ReactiveValue<any, FieldContext>, context: FieldContext): any {
  if (typeof value === 'function') {
    return (value as (ctx: FieldContext) => any)(context)
  }
  return unref(value)
}

// 深度解析对象中的响应式属性 - 直接解析，不缓存
function resolveReactiveObject<T extends Record<string, any>>(
  obj: T,
  context: FieldContext,
): T {
  // 处理数组
  if (Array.isArray(obj)) {
    return obj.map((item) => {
      if (typeof item === 'object' && item !== null && !isRef(item) && !isVNode(item)) {
        return resolveReactiveObject(item, context)
      }
      return resolveReactiveValue(item, context)
    }) as unknown as T
  }

  // 处理对象
  const result = {} as T
  for (const [key, value] of Object.entries(obj)) {
    if (typeof value === 'object' && value !== null && !isRef(value) && !isVNode(value)) {
      (result as any)[key] = resolveReactiveObject(value, context)
    }
    else {
      (result as any)[key] = resolveReactiveValue(value, context)
    }
  }
  return result
}

// 简化 fields 计算属性 - 仅处理静态结构
const fields = computedEager(() => {
  if (!schema)
    return []

  const resolvedSchema = unref(schema)
  // 使用 markRaw 确保控件映射中的组件不会被转换为响应式
  const rawDefaultControls = markRaw(DEFAULT_CONTROLS)
  const rawControls = controls ? markRaw(controls) : undefined
  const mapping = defu(rawControls, rawDefaultControls)
  const entries = introspectSchema(resolvedSchema)

  return entries.map((entry) => {
    const control = resolveControl(entry, mapping)
    // 确保控件组件使用 markRaw
    if (control?.component && typeof control.component !== 'string') {
      control.component = markRaw(control.component)
    }
    return {
      path: entry.path,
      schema: entry.schema,
      zodType: entry.zodType,
      meta: entry.meta,
      decorators: entry.decorators,
      control,
    }
  })
})

// 可见字段计算 - 统一可见性逻辑
const visibleFields = computedEager(() => {
  return fields.value.filter((field) => {
    const context = createFieldContext(field.path)

    // 统一可见性判断: control.if
    const controlIf = field.control?.if ? resolveReactiveValue(field.control.if, context) : true
    return controlIf !== false
  })
})

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

// 精简插槽属性 - 仅输出核心属性
function buildSlotProps(field: any): any {
  const context = createFieldContext(field.path)
  return {
    get state() { return context.state },
    path: context.path,
    get value() { return context.value },
    setValue: context.setValue,
  }
}

// 辅助函数：解析字段属性并返回正确类型
function resolveFieldProp<T = any>(field: any, prop: string, defaultValue?: T): T | undefined {
  const value = field.meta?.[prop]
  if (value === undefined)
    return defaultValue
  const context = createFieldContext(field.path)
  const resolved = resolveReactiveValue(value, context)

  return resolved
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

// 简化后的渲染控件 - 无缓存
function renderControl(field: any) {
  const control = field?.control
  const comp = control?.component as any
  if (!comp) {
    return h('div', { class: 'text-red-500' }, `[AutoForm] 控件未映射: ${field?.path ?? ''}`)
  }
  if (isVNode(comp))
    return comp

  const component = typeof comp === 'string' ? resolveDynamicComponent(comp) : comp
  const context = createFieldContext(field.path)

  // 直接解析，不缓存
  const props = control?.props ? resolveReactiveObject(control.props, context) : {}
  const slots = control?.slots ? resolveReactiveObject(control.slots, context) : {}

  const userOnUpdate = props['onUpdate:modelValue']
  const rest = { ...props }
  delete rest['onUpdate:modelValue']

  const slotProps = buildSlotProps(field)
  const wrapped = enhanceEventProps(rest, slotProps)

  return h(
    component as any,
    {
      ...wrapped,
      'onUpdate:modelValue': (v: any) => {
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
function getResolvedFieldSlots(field: any) {
  if (!field.meta?.fieldSlots)
    return undefined
  const context = createFieldContext(field.path)
  return resolveReactiveValue(field.meta.fieldSlots, context)
}

function hasNamedSlot(field: any, name: keyof FormFieldSlots) {
  const keySpecific = `${name}:${field.path}`
  const s = _slots as any
  const fieldSlots = getResolvedFieldSlots(field)
  return Boolean(fieldSlots?.[name] || s?.[keySpecific] || s?.[name])
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
  <UForm :state="state" :schema="unref(schema)" v-bind="restProps" @submit="emit('submit', $event)" @error="emit('error', $event)">
    <slot name="before-fields" :fields="visibleFields" :state="state" />
    <template v-for="field in visibleFields" :key="field.path">
      <UFormField
        v-show="!resolveFieldProp(field, 'hidden')"
        :as="resolveFieldProp(field, 'as')"
        :name="field.path"
        :error-pattern="field.meta?.errorPattern"
        :label="resolveFieldProp(field, 'label')"
        :description="resolveFieldProp(field, 'description')"
        :help="resolveFieldProp(field, 'help')"
        :hint="resolveFieldProp(field, 'hint')"
        :size="resolveFieldProp(field, 'size', size)"
        :required="resolveFieldProp(field, 'required')"
        :eager-validation="field.meta?.eagerValidation"
        :validate-on-input-delay="field.meta?.validateOnInputDelay"
        :class="resolveFieldProp(field, 'class')"
        :ui="resolveFieldProp(field, 'ui')"
      >
        <template v-if="hasNamedSlot(field, 'label')" #label="{ label }">
          <slot :name="`label:${field.path}`" v-bind="{ label, ...buildSlotProps(field) }">
            <slot name="label" v-bind="{ label, ...buildSlotProps(field) }">
              <VNodeRender
                :node="renderFieldSlot(getResolvedFieldSlots(field)?.label, { label, ...buildSlotProps(field) })"
              />
            </slot>
          </slot>
        </template>
        <template v-if="hasNamedSlot(field, 'hint')" #hint="{ hint }">
          <slot :name="`hint:${field.path}`" v-bind="{ hint, ...buildSlotProps(field) }">
            <slot name="hint" v-bind="{ hint, ...buildSlotProps(field) }">
              <VNodeRender :node="renderFieldSlot(getResolvedFieldSlots(field)?.hint, { hint, ...buildSlotProps(field) })" />
            </slot>
          </slot>
        </template>
        <template v-if="hasNamedSlot(field, 'description')" #description="{ description }">
          <slot :name="`description:${field.path}`" v-bind="{ description, ...buildSlotProps(field) }">
            <slot name="description" v-bind="{ description, ...buildSlotProps(field) }">
              <VNodeRender
                :node="renderFieldSlot(getResolvedFieldSlots(field)?.description, { description, ...buildSlotProps(field) })"
              />
            </slot>
          </slot>
        </template>
        <template v-if="hasNamedSlot(field, 'help')" #help="{ help }">
          <slot :name="`help:${field.path}`" v-bind="{ help, ...buildSlotProps(field) }">
            <slot name="help" v-bind="{ help, ...buildSlotProps(field) }">
              <VNodeRender :node="renderFieldSlot(getResolvedFieldSlots(field)?.help, { help, ...buildSlotProps(field) })" />
            </slot>
          </slot>
        </template>
        <template v-if="hasNamedSlot(field, 'error')" #error="{ error }">
          <slot :name="`error:${field.path}`" v-bind="{ error, ...buildSlotProps(field) }">
            <slot name="error" v-bind="{ error, ...buildSlotProps(field) }">
              <VNodeRender
                :node="renderFieldSlot(getResolvedFieldSlots(field)?.error, { error, ...buildSlotProps(field) })"
              />
            </slot>
          </slot>
        </template>
        <template #default="{ error }">
          <slot :name="`default:${field.path}`" v-bind="{ error, ...buildSlotProps(field) }">
            <slot name="default" v-bind="{ error, ...buildSlotProps(field) }">
              <VNodeRender
                :node="renderFieldSlot(getResolvedFieldSlots(field)?.default, { error, ...buildSlotProps(field) })"
              />
              <template v-if="!field.meta?.fieldSlots || !getResolvedFieldSlots(field)?.default">
                <VNodeRender :node="renderControl(field)" />
              </template>
            </slot>
          </slot>
        </template>
      </UFormField>
    </template>
    <slot name="after-fields" :fields="visibleFields" :state="state" />
    <!-- <slot name="submit" :state="state" /> -->
  </UForm>
</template>
