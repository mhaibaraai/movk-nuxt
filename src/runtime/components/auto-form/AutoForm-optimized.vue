<script setup lang="ts" generic="S extends z.ZodObject, T extends boolean = true, N extends boolean = false">
import type { FormData, FormError, FormErrorEvent, FormInputEvents, FormSubmitEvent, InferInput } from '@nuxt/ui'
import type { GlobalAutoFormMeta, z } from 'zod/v4'
import type { AutoFormControls, AutoFormField, DynamicFormSlots } from '../../types/auto-form'
import { UForm } from '#components'
import { computed, shallowRef, watchEffect } from 'vue'
import { useAutoFormProvider } from '../../composables/useAutoFormContext'
import { DEFAULT_CONTROLS } from '../../constants/auto-form'
import { deepClone, getPath, setPath } from '../../core'
import { flattenFields, introspectSchema, isLeafField } from '../../utils/auto-form-optimized'
import AutoFormFieldRenderer from './AutoFormFieldRenderer.vue'
import AutoFormNestedRenderer from './AutoFormNestedRenderer.vue'

export interface AutoFormProps<S extends z.ZodObject, T extends boolean = true, N extends boolean = false> {
  id?: string | number
  schema?: S
  validate?: (state: Partial<InferInput<S>>) => Promise<FormError[]> | FormError[]
  validateOn?: FormInputEvents[]
  disabled?: boolean
  name?: N extends true ? string : never
  validateOnInputDelay?: number
  transform?: T
  nested?: N
  loadingAuto?: boolean
  class?: any
  onSubmit?: ((event: FormSubmitEvent<FormData<S, T>>) => void | Promise<void>) | (() => void | Promise<void>)
  controls?: AutoFormControls
  globalMeta?: GlobalAutoFormMeta
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

defineEmits<AutoFormEmits<S, T>>()
const _slots = defineSlots<AutoFormSlots<AutoFormStateType>>()

const state = defineModel<AutoFormStateType>({ default: () => ({}) })
const { resolveFieldProp } = useAutoFormProvider(state, _slots)

// 缓存优化：使用 shallowRef 避免深度响应式
const controlsMapping = shallowRef({
  ...DEFAULT_CONTROLS,
  ...controls,
})

// 监听 controls 变化并更新缓存
watchEffect(() => {
  controlsMapping.value = {
    ...DEFAULT_CONTROLS,
    ...controls,
  }
})

// 优化字段计算 - 添加依赖追踪和缓存
const fields = computed(() => {
  if (!schema)
    return []

  const entries = introspectSchema(schema, controlsMapping.value, '', globalMeta)

  // 批量处理默认值设置，减少响应式更新
  const updates: Array<{ path: string, value: any }> = []

  for (let i = 0; i < entries.length; i++) {
    const entry = entries[i]
    if (entry && entry.decorators?.defaultValue !== undefined && getPath(state.value, entry.path) === undefined) {
      updates.push({ path: entry.path, value: deepClone(entry.decorators.defaultValue) })
    }
  }

  // 批量应用更新
  for (let i = 0; i < updates.length; i++) {
    const update = updates[i]
    if (update) {
      setPath(state.value, update.path, update.value)
    }
  }

  return entries
})

// 优化可见字段计算 - 使用浅层计算
const visibleFields = computed(() => {
  const result: AutoFormField[] = []
  const fieldsArray = fields.value

  for (let i = 0; i < fieldsArray.length; i++) {
    const field = fieldsArray[i]
    if (field && resolveFieldProp<boolean | undefined>(field, 'if', true)) {
      result.push(field)
    }
  }

  return result
})

// 预计算渲染策略 - 避免重复计算
const renderStrategy = computed(() => {
  const visibleFieldsArray = visibleFields.value
  const entries: Array<{ field: AutoFormField, isLeaf: boolean }> = []
  let hasNestedFields = false

  for (let i = 0; i < visibleFieldsArray.length; i++) {
    const field = visibleFieldsArray[i]
    if (field) {
      const isLeaf = isLeafField(field)
      entries.push({ field, isLeaf })

      if (!isLeaf) {
        hasNestedFields = true
      }
    }
  }

  return {
    entries,
    useNestedRendering: hasNestedFields,
    flatFields: hasNestedFields ? [] : flattenFields(visibleFieldsArray),
  }
})

// 从预计算的策略中提取值
const topLevelEntries = computed(() => renderStrategy.value.entries)
const useNestedRendering = computed(() => renderStrategy.value.useNestedRendering)
const flatRenderFields = computed(() => renderStrategy.value.flatFields)
</script>

<template>
  <UForm :state="state" :schema="schema" v-bind="restProps">
    <slot name="before-fields" :fields="visibleFields" :state="state" />

    <!-- 优化渲染：减少条件判断 -->
    <template v-if="useNestedRendering">
      <template v-for="entry in topLevelEntries" :key="entry.field.path">
        <AutoFormFieldRenderer v-if="entry.isLeaf" :field="entry.field" :schema="schema" />
        <AutoFormNestedRenderer v-else :field="entry.field" :schema="schema" />
      </template>
    </template>

    <template v-else>
      <AutoFormFieldRenderer v-for="field in flatRenderFields" :key="field.path" :field="field" :schema="schema" />
    </template>

    <slot name="after-fields" :fields="visibleFields" :state="state" />

    <UButton type="submit">
      Submit
    </UButton>
  </UForm>
</template>
