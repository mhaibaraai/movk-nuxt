<script setup lang="ts" generic="S extends z.ZodObject, T extends boolean = true, N extends boolean = false">
import type { FormData, FormError, FormErrorEvent, FormInputEvents, FormSubmitEvent, InferInput } from '@nuxt/ui'
import type { GlobalAutoFormMeta, z } from 'zod/v4'
import type { AutoFormControls, AutoFormField, DynamicFormSlots } from '../../types/auto-form'
import { UForm } from '#components'
import { computed } from 'vue'
import { useAutoFormProvider } from '../../composables/useAutoFormContext'
import { DEFAULT_CONTROLS } from '../../constants/auto-form'
import { deepClone, getPath, setPath } from '../../core'
import { flattenFields, introspectSchema, isLeafField } from '../../utils/auto-form'
import AutoFormFieldRenderer from './AutoFormFieldRenderer.vue'
import AutoFormNestedRenderer from './AutoFormNestedRenderer.vue'

export interface AutoFormProps<S extends z.ZodObject, T extends boolean = true, N extends boolean = false> {
  id?: string | number
  /** Schema to validate the form state. Supports Standard Schema objects, Yup, Joi, and Superstructs. */
  schema?: S
  /**
   * 全局字段元数据配置，作为 schema 元数据的默认值
   */
  globalMeta?: GlobalAutoFormMeta
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

  /**
   * 自定义控件映射
   */
  controls?: AutoFormControls

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
  globalMeta,
  ...restProps
} = defineProps<AutoFormProps<S, T, N>>()
const emit = defineEmits<AutoFormEmits<S, T>>()
const _slots = defineSlots<AutoFormSlots<AutoFormStateType>>()

const state = defineModel<AutoFormStateType>({ default: () => ({}) })

const { resolveFieldProp } = useAutoFormProvider(state, _slots)

const controlsMapping = computed(() => ({
  ...DEFAULT_CONTROLS,
  ...controls,
}))

// 优化字段计算 - 仅在 schema 或映射真正变化时重新计算
const fields = computed(() => {
  if (!schema)
    return []

  const entries = introspectSchema(schema, controlsMapping.value, undefined, globalMeta)

  // 同步初始化默认值，确保 SSR 兼容性
  for (const { decorators, path } of entries) {
    if (decorators?.defaultValue !== undefined
      && getPath(state.value, path) === undefined) {
      setPath(state.value, path, deepClone(decorators.defaultValue))
    }
  }

  return entries
})

const visibleFields = computed(() =>
  fields.value.filter((field: AutoFormField) => resolveFieldProp<boolean | undefined>(field, 'if', true)),
)

const topLevelEntries = computed(() =>
  visibleFields.value.map(field => ({ field, isLeaf: isLeafField(field) })),
)

const useNestedRendering = computed(() =>
  topLevelEntries.value.some(entry => !entry.isLeaf),
)

const nestedRenderEntries = computed(() =>
  useNestedRendering.value ? topLevelEntries.value : [],
)

const flatRenderFields = computed(() =>
  useNestedRendering.value ? [] : flattenFields(visibleFields.value),
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

    <template v-if="useNestedRendering">
      <template v-for="entry in nestedRenderEntries" :key="entry.field.path">
        <AutoFormFieldRenderer v-if="entry.isLeaf" :field="entry.field" :schema="schema" />
        <AutoFormNestedRenderer v-else :field="entry.field" :schema="schema" />
      </template>
    </template>

    <template v-else>
      <AutoFormFieldRenderer v-for="field in flatRenderFields" :key="field.path" :field="field" :schema="schema" />
    </template>

    <slot name="after-fields" :fields="visibleFields" :state="state" />
    <!-- <slot name="submit" :state="state" /> -->
  </UForm>
</template>
