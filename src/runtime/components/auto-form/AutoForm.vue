<script setup lang="ts" generic="S extends z.ZodObject, T extends boolean = true">
import type { AnyObject } from '@movk/core'
import type { FormData, FormError, FormErrorEvent, FormFieldSlots, FormInputEvents, FormSubmitEvent, InferInput } from '@nuxt/ui'
import type { ComputedRef, Ref } from 'vue'
import type { z } from 'zod/v4'
import type { AutoFormControls } from '../../types'
import defu from 'defu'
import { computed, Fragment, h, isRef, isVNode, resolveDynamicComponent, unref, watch } from 'vue'
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

// 响应式值类型定义
type ReactiveValue<T> = T | (() => T) | ComputedRef<T> | Ref<T>

const { schema, controls, size, ...props } = defineProps<AutoFormProps<S, T>>()
const emit = defineEmits<AutoFormEmits<S, T>>()
const _slots = defineSlots<AutoFormSlots>()

const state = defineModel<FormStateType>({ default: () => ({} as FormStateType) })

// 响应式值解析函数
function resolveReactiveValue<T>(value: ReactiveValue<T>, _context?: any): T {
  if (typeof value === 'function') {
    return (value as () => T)()
  }
  return unref(value)
}

// 深度解析对象中的响应式属性
function resolveReactiveObject<T extends Record<string, any>>(
  obj: T,
  context?: any,
): T {
  const result = { ...obj } as T
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

const fields = computed(() => {
  if (!schema)
    return [] as any[]

  // 支持computed schema
  const resolvedSchema = unref(schema)
  const mapping = defu(controls, DEFAULT_CONTROLS)
  const entries = introspectSchema(resolvedSchema)

  return entries.map((entry) => {
    // 构建字段上下文
    const fieldContext = {
      state: state.value,
      path: entry.path,
      allFields: entries,
      id: `${entry.path}-${Date.now()}`,
    }

    // 解析meta中的响应式属性
    const resolvedMeta = resolveReactiveObject(entry.meta || {}, fieldContext)

    // 解析控制器
    const control = resolveControl(entry, mapping)
    const resolvedControl = {
      ...control,
      show: resolveReactiveValue(control?.show, fieldContext),
      props: resolveReactiveObject(control?.props || {}, fieldContext),
      slots: resolveReactiveObject(control?.slots || {}, fieldContext),
    }

    return {
      path: entry.path,
      schema: entry.schema,
      zodType: entry.zodType,
      meta: resolvedMeta,
      decorators: entry.decorators,
      control: resolvedControl,
      context: fieldContext,
    }
  }).filter((field) => {
    // 动态解析if和show条件
    const ifCondition = resolveReactiveValue(field.meta?.if, field.context)
    const showCondition = resolveReactiveValue(field.control?.show, field.context)
    return ifCondition !== false && showCondition !== false
  })
})

// 优化默认值初始化逻辑
watch(
  () => fields.value.length,
  (next, prev) => {
    if (next > 0 && (prev === 0 || prev === undefined) && schema) {
      initializeDefaultValues(fields.value, state.value)
    }
  },
  { immediate: true },
)

// 增强的插槽属性构建函数
function buildSlotProps(field: any) {
  return {
    // 基础信息
    state,
    zodType: field.zodType,
    meta: field.meta,
    path: field.path,
    schema: field.schema,
    context: field.context,

    // 值操作
    value: getPath(state.value, field.path),
    setValue: (v: any) => setPath(state.value, field.path, v),

    // 增强的辅助函数
    getFieldValue: (path: string) => getPath(state.value, path),
    setFieldValue: (path: string, value: any) => setPath(state.value, path, value),

    // 响应式解析器
    resolve: (value: any) => resolveReactiveValue(value, field.context),

    // 字段查找
    findField: (path: string) => fields.value.find(f => f.path === path),

    // 条件检查
    isVisible: (path?: string) => {
      const targetField = path ? fields.value.find(f => f.path === path) : field
      return targetField
        ? resolveReactiveValue(targetField.control?.show, targetField.context) !== false
        : false
    },
  }
}

function initializeDefaultValues(fields: any[], stateValue: any) {
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

// 字段可见性解析函数
function resolveFieldVisibility(field: any): boolean {
  const show = resolveReactiveValue(field.meta?.show, field.context)
  const controlShow = resolveReactiveValue(field.control?.show, field.context)
  return show !== false && controlShow !== false
}

function renderControl(field: any) {
  const control = field?.control
  const comp = control?.component as any
  if (!comp) {
    return h('div', { class: 'text-red-500' }, `[AutoForm] 控件未映射: ${field?.path ?? ''}`)
  }
  if (isVNode(comp))
    return comp
  const component = resolveDynamicComponent(comp)

  // 动态解析props
  const dynamicProps = resolveReactiveObject(control?.props || {}, field.context)

  // 验证事件属性
  if (dynamicProps) {
    for (const key of Object.keys(dynamicProps)) {
      if (/^on[A-Z].+/.test(key) && typeof (dynamicProps as any)[key] !== 'function')
        console.warn(`[AutoForm] 事件属性应为函数: ${key} @ ${field.path}`)
    }
  }

  const userOnUpdate = (dynamicProps as any)?.['onUpdate:modelValue']
  const rest = { ...dynamicProps }
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
    // 动态解析slots
    resolveReactiveObject(control?.slots || {}, field.context),
  )
}

function renderFieldSlot(fn?: (props?: any) => any, slotProps?: any) {
  return fn ? (fn as any)(slotProps) : null
}

function hasNamedSlot(field: any, name: keyof FormFieldSlots) {
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
  <UForm :state="state" :schema="unref(schema)" v-bind="props" @submit="emit('submit', $event)" @error="emit('error', $event)">
    <slot name="before-fields" :fields="fields" :state="state" />
    <template v-for="field in fields" :key="field.path">
      <Transition>
        <UFormField
          v-show="resolveFieldVisibility(field)"
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
