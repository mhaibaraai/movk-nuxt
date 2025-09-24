<script setup lang="ts" generic="S extends z.ZodObject, T extends boolean = true">
import type { FormData, FormError, FormErrorEvent, FormInputEvents, FormSubmitEvent, InferInput } from '@nuxt/ui'
import type { z } from 'zod/v4'
import type { AutoFormAccordionProps, AutoFormControls, AutoFormField, DynamicFormSlots } from '../../types/auto-form'
import { computed } from 'vue'
import { useAutoFormProvider } from '../../composables/useAutoFormContext'
import { DEFAULT_CONTROLS } from '../../constants/auto-form'
import { deepClone, getPath, setPath } from '../../core'
import { introspectSchema } from '../../utils/auto-form/introspection'
import { flattenFields, getFieldType, isLeafField } from '../../utils/auto-form/rendering'
import AutoFormNestedRenderer from './AutoFormAccordionRenderer.vue'
import AutoFormFieldRenderer from './AutoFormFieldRenderer.vue'

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
   * Path of the form's state within it's parent form.
   * Used for nesting forms. Only available if `nested` is true.
   */
  // name?: N extends true ? string : never

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
  // nested?: N

  /**
   * When `true`, all form elements will be disabled on `@submit` event.
   * This will cause any focused input elements to lose their focus state.
   * @defaultValue `true`
   */
  loadingAuto?: boolean
  class?: any
  onSubmit?: ((event: FormSubmitEvent<FormData<S, T>>) => void | Promise<void>) | (() => void | Promise<void>)

  /**
   * 自定义控件映射
   */
  controls?: AutoFormControls

  /**
   * Enable transition animation for field changes.
   * @defaultValue `true`
   */
  enableTransition?: boolean

  /**
   * 用于控制对象字段的折叠展示
   */
  accordion?: AutoFormAccordionProps
}

export interface AutoFormEmits<S extends z.ZodObject, T extends boolean = true> {
  submit: [event: FormSubmitEvent<FormData<S, T>>]
  error: [event: FormErrorEvent]
}

export type AutoFormSlots<T extends object> = {
  'before-fields': (props: { fields: AutoFormField[], state: T }) => any
  'after-fields': (props: { fields: AutoFormField[], state: T }) => any
} & DynamicFormSlots<T>

// type AutoFormStateType = N extends false ? Partial<InferInput<S>> : never
type AutoFormStateType = Partial<InferInput<S>>
const {
  schema,
  controls,
  enableTransition = true,
  accordion,
  ...restProps
} = defineProps<AutoFormProps<S, T>>()
const emit = defineEmits<AutoFormEmits<S, T>>()
const _slots = defineSlots<AutoFormSlots<AutoFormStateType>>()

const state = defineModel<AutoFormStateType>({ default: () => ({}) })

// 使用统一的字段渲染器和插槽渲染器
const { resolveFieldProp } = useAutoFormProvider(state, _slots)

// 分离控件映射计算，避免重复创建对象
const controlsMapping = computed(() => ({
  ...DEFAULT_CONTROLS,
  ...controls,
}))

// 优化字段计算 - 仅在 schema 或映射真正变化时重新计算
const fields = computed(() => {
  if (!schema)
    return []

  const entries = introspectSchema(schema, controlsMapping.value)

  // 同步初始化默认值，确保 SSR 兼容性
  for (const { decorators, path } of entries) {
    if (decorators?.defaultValue !== undefined
      && getPath(state.value, path) === undefined) {
      setPath(state.value, path, deepClone(decorators.defaultValue))
    }
  }

  // dev
  console.log('entries', entries)

  return entries
})

// 优化可见性计算 - 减少不必要的函数调用
const visibleFields = computed(() =>
  fields.value.filter((field: AutoFormField) => resolveFieldProp<boolean | undefined>(field, 'if', true)),
)

// 检查是否启用嵌套渲染模式
const useNestedRendering = computed(() =>
  accordion?.enabled && visibleFields.value.some(field => !isLeafField(field)),
)

// 获取要渲染的字段
const renderFields = computed(() =>
  useNestedRendering.value ? visibleFields.value : flattenFields(visibleFields.value),
)
</script>

<template>
  <UForm
    :state="state"
    :schema="schema"
    v-bind="restProps"
    @submit="emit('submit', $event)"
    @error="emit('error', $event)"
  >
    <slot name="before-fields" :fields="visibleFields" :state="state" />

    <!-- 嵌套渲染模式：按原始顺序渲染，保持字段位置关系 -->
    <template v-if="useNestedRendering">
      <TransitionGroup :name="enableTransition ? 'auto-form-field' : ''" :duration="{ enter: 350, leave: 250 }">
        <template v-for="field in renderFields" :key="field.path">
          <AutoFormFieldRenderer v-if="getFieldType(field) === 'leaf'" :field="field" :schema="schema" />
          <AutoFormNestedRenderer v-else :field="field" :schema="schema" :accordion="accordion" />
        </template>
      </TransitionGroup>
    </template>

    <!-- 扁平渲染模式：传统的扁平化字段渲染 -->
    <template v-else>
      <TransitionGroup :name="enableTransition ? 'auto-form-field' : ''" :duration="{ enter: 350, leave: 250 }">
        <AutoFormFieldRenderer
          v-for="field in renderFields"
          :key="field.path"
          :field="field"
          :schema="schema"
        />
      </TransitionGroup>
    </template>

    <slot name="after-fields" :fields="visibleFields" :state="state" />
    <!-- <slot name="submit" :state="state" /> -->
  </UForm>
</template>
