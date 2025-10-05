<script setup lang="ts" generic="S extends z.ZodObject, T extends boolean = true, N extends boolean = false">
import type { FormData, FormError, FormErrorEvent, FormInputEvents, FormSubmitEvent, InferInput } from '@nuxt/ui'
import type { GlobalAutoFormMeta, z } from 'zod/v4'
import type { AutoFormControls, AutoFormField, DynamicFormSlots } from '../../types/auto-form'
import { UForm } from '#components'
import { computed, watch } from 'vue'
import { useAutoFormProvider } from '../../composables/useAutoFormContext'
import { DEFAULT_CONTROLS } from '../../constants/auto-form'
import { deepClone, getPath, setPath } from '../../core'
import { introspectSchema, isLeafField } from '../../utils/auto-form'
import AutoFormArrayRenderer from './AutoFormArrayRenderer.vue'
import AutoFormFieldRenderer from './AutoFormFieldRenderer.vue'
import AutoFormNestedRenderer from './AutoFormNestedRenderer.vue'

export interface AutoFormProps<S extends z.ZodObject, T extends boolean = true, N extends boolean = false> {
  id?: string | number
  /** Schema to validate the form state */
  schema?: S
  /** Custom validation function */
  validate?: (state: Partial<InferInput<S>>) => Promise<FormError[]> | FormError[]
  /**
   * Input events that trigger validation
   * @default ['blur', 'change', 'input']
   */
  validateOn?: FormInputEvents[]
  /** Disable all inputs */
  disabled?: boolean
  /** Form path for nesting (only when nested=true) */
  name?: N extends true ? string : never
  /**
   * Validation delay
   * @default 300
   */
  validateOnInputDelay?: number
  /**
   * Apply schema transformations
   * @default true
   */
  transform?: T
  /**
   * Nested form mode
   * @default false
   */
  nested?: N
  /**
   * Auto-disable on submit
   * @default true
   */
  loadingAuto?: boolean
  /**
   * 是否显示默认提交按钮
   * @default true
   */
  submitButton?: boolean
  /**
   * 是否启用字段过渡动画
   * @default true
   */
  enableTransition?: boolean
  class?: any
  onSubmit?: ((event: FormSubmitEvent<FormData<S, T>>) => void | Promise<void>) | (() => void | Promise<void>)
  /** 自定义控件映射 */
  controls?: AutoFormControls
  /** 全局字段元数据配置 */
  globalMeta?: GlobalAutoFormMeta
}

export interface AutoFormEmits<S extends z.ZodObject, T extends boolean = true> {
  submit: [event: FormSubmitEvent<FormData<S, T>>]
  error: [event: FormErrorEvent]
}

export interface AutoFormSlotProps<T> {
  errors: FormError[]
  loading: boolean
  fields: AutoFormField[]
  state: T
}

export type AutoFormSlots<T extends object> = {
  header: (props: AutoFormSlotProps<T>) => any
  footer: (props: AutoFormSlotProps<T>) => any
  submit: (props: AutoFormSlotProps<T>) => any
} & DynamicFormSlots<T>

type AutoFormStateType = N extends false ? Partial<InferInput<S>> : never
const {
  schema,
  controls,
  globalMeta,
  submitButton = true,
  enableTransition = true,
  ...restProps
} = defineProps<AutoFormProps<S, T, N>>()

defineEmits<AutoFormEmits<S, T>>()
const _slots = defineSlots<AutoFormSlots<AutoFormStateType>>()

const state = defineModel<AutoFormStateType>({ default: () => ({}) })

const { resolveFieldProp } = useAutoFormProvider(state, _slots)

const controlsMapping = computed(() => ({
  ...DEFAULT_CONTROLS,
  ...controls,
}))

const fields = computed(() => {
  if (!schema)
    return []

  const _fields = introspectSchema(schema, controlsMapping.value, '', globalMeta)
  if (import.meta.client) {
    console.log(_fields)
  }
  return _fields
  //  return introspectSchema(schema, controlsMapping.value, '', globalMeta)
})

watch([fields, state], ([currentFields, stateValue]) => {
  if (!currentFields.length)
    return

  // 批量收集需要设置的默认值
  const updates: Array<{ path: string, value: any }> = []

  for (const field of currentFields) {
    if (field?.decorators?.defaultValue !== undefined
      && getPath(stateValue, field.path) === undefined) {
      updates.push({
        path: field.path,
        value: deepClone(field.decorators.defaultValue),
      })
    }
  }

  if (updates.length > 0) {
    for (const { path, value } of updates) {
      setPath(stateValue, path, value)
    }
  }
}, {
  immediate: true,
  flush: 'post',
})

const visibleFields = computed(() =>
  // Todo: if 为函数时，且值为undefined，返回false
  fields.value.filter(field =>
    field && resolveFieldProp<boolean | undefined>(field, 'if', true),
  ),
)

const renderData = computed(() => {
  const visibleFieldsArray = visibleFields.value
  const leafFields: AutoFormField[] = []
  const nestedFields: AutoFormField[] = []
  const arrayFields: AutoFormField[] = []

  // 单次遍历完成分类
  for (const field of visibleFieldsArray) {
    if (field.meta.type === 'array') {
      arrayFields.push(field)
    }
    else if (isLeafField(field)) {
      leafFields.push(field)
    }
    else {
      nestedFields.push(field)
    }
  }

  const hasNestedFields = nestedFields.length > 0 || arrayFields.length > 0

  return {
    leafFields,
    nestedFields,
    arrayFields,
    hasNestedFields,
    flatFields: hasNestedFields ? [] : leafFields,
    allFields: visibleFieldsArray,
  }
})
</script>

<template>
  <UForm :state="state" :schema="schema" v-bind="restProps">
    <template #default="{ errors, loading }">
      <slot name="header" v-bind="{ errors, loading, fields: visibleFields, state }" />

      <template v-if="renderData.hasNestedFields">
        <TransitionGroup :name="enableTransition ? 'auto-form-field' : ''">
          <template v-for="field in renderData.allFields" :key="field.path">
            <AutoFormFieldRenderer
              v-if="renderData.leafFields.includes(field)"
              :field="field"
              :schema="schema"
              :extra-props="{ errors, loading }"
            />
            <AutoFormArrayRenderer
              v-else-if="renderData.arrayFields.includes(field)"
              :field="field"
              :schema="schema"
              :state="state"
              :enable-transition="enableTransition"
              :extra-props="{ errors, loading }"
            />
            <AutoFormNestedRenderer v-else :field="field" :schema="schema" :extra-props="{ errors, loading }" />
          </template>
        </TransitionGroup>
      </template>

      <template v-else>
        <TransitionGroup :name="enableTransition ? 'auto-form-field' : ''">
          <AutoFormFieldRenderer
            v-for="field in renderData.flatFields"
            :key="field.path"
            :field="field"
            :schema="schema"
            :extra-props="{ errors, loading }"
          />
        </TransitionGroup>
      </template>

      <slot name="footer" v-bind="{ errors, loading, fields: visibleFields, state }" />

      <slot name="submit" v-bind="{ errors, loading, fields: visibleFields, state }">
        <UButton v-if="submitButton" type="submit" :loading="loading" label="提交" block />
      </slot>
    </template>
  </UForm>
</template>
