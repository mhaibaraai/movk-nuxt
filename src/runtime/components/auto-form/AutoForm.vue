<script setup lang="ts" generic="S extends z.ZodObject, T extends boolean = true, N extends boolean = false">
import type { FormData, FormError, FormErrorEvent, FormInputEvents, FormSubmitEvent, InferInput } from '@nuxt/ui'
import type { z } from 'zod/v4'
import type { AutoFormControls, AutoFormField, DynamicFormSlots } from '../../types/auto-form'
import { computed, unref } from 'vue'
import { useAutoFormProvider } from '../../composables/useAutoFormContext'
import { DEFAULT_CONTROLS } from '../../constants/auto-form'
import { deepClone, getPath, setPath } from '../../core'
import { introspectSchema } from '../../utils/auto-form'
import AutoFormFieldRenderer from './AutoFormFieldRenderer.vue'

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

// 初始化字段上下文管理
useAutoFormProvider(state, _slots)

// 分离控件映射计算，避免重复创建对象
const controlsMapping = computed(() => ({
  ...DEFAULT_CONTROLS,
  ...controls,
}))

// 优化字段计算 - 仅在 schema 或映射真正变化时重新计算
const fields = computed(() => {
  if (!schema)
    return []

  const resolvedSchema = unref(schema)
  const entries = introspectSchema(resolvedSchema, controlsMapping.value)

  // 同步初始化默认值，确保 SSR 兼容性
  for (const { decorators, path } of entries) {
    if (decorators?.defaultValue !== undefined
      && getPath(state.value, path) === undefined) {
      setPath(state.value, path, deepClone(decorators.defaultValue))
    }
  }

  return entries
})

// 优化可见性计算 - 减少不必要的函数调用
const visibleFields = computed(() => fields.value.filter((field: AutoFormField) => {
  const hasIfCondition = field.meta?.if !== undefined || field.meta.mapped?.if !== undefined
  if (!hasIfCondition)
    return true

  // 直接处理简单的 if 条件，避免推迟到子组件
  const ifValue = field.meta?.if !== undefined ? field.meta.if : field.meta.mapped?.if

  // 对于函数类型的条件，创建字段上下文进行计算
  if (typeof ifValue === 'function') {
    const context = {
      state: state.value,
      path: field.path,
      value: getPath(state.value, field.path),
      setValue: (v: any) => setPath(state.value, field.path, v),
    }
    return ifValue(context)
  }

  return ifValue === true
}))

// 字段属性解析逻辑已移至 useFieldRenderer composable
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
        <AutoFormFieldRenderer :field="field" :schema="schema" :name="name" :size="size" />
      </template>
    </TransitionGroup>
    <slot name="after-fields" :fields="visibleFields" :state="state" />
    <!-- <slot name="submit" :state="state" /> -->
  </UForm>
</template>
