<script setup lang="ts" generic="S extends z.ZodObject, T extends boolean = true, N extends boolean = false">
import type { ButtonProps, FormEmits, FormProps, InferInput } from '@nuxt/ui'
import type { z } from 'zod/v4'
import type { ZodAutoFormFieldMeta } from '../types/zod'
import type { AutoFormControls, AutoFormField, AutoFormSlotProps, DynamicFormSlots } from '../types/auto-form'
import { UForm } from '#components'
import type { Ref } from 'vue'
import { computed, onMounted, ref, useTemplateRef } from 'vue'
import { useAutoFormProvider } from '../internal/useAutoFormProvider'
import { getPath, setPath } from '@movk/core'
import { classifyFields, extractPureSchema, introspectSchema } from '../utils/auto-form'
import AutoFormRendererArray from './auto-form-renderer/AutoFormRendererArray.vue'
import AutoFormRendererField from './auto-form-renderer/AutoFormRendererField.vue'
import AutoFormRendererLayout from './auto-form-renderer/AutoFormRendererLayout.vue'
import AutoFormRendererNested from './auto-form-renderer/AutoFormRendererNested.vue'
import { useAutoForm } from '../composables/useAutoForm'

export interface AutoFormProps<S extends z.ZodObject, T extends boolean = true, N extends boolean = false> extends FormProps<S, T, N> {
  /**
   * 是否显示默认提交按钮
   * @default true
   */
  submitButton?: boolean
  /** 提交按钮属性 */
  submitButtonProps?: ButtonProps
  /** 自定义控件映射 */
  controls?: AutoFormControls
  /** 全局字段元数据配置 */
  globalMeta?: ZodAutoFormFieldMeta
  /** 数组字段添加按钮属性 */
  addButtonProps?: ButtonProps
}

export interface AutoFormEmits<S extends z.ZodObject, T extends boolean = true> extends FormEmits<S, T> {
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
  submitButtonProps,
  addButtonProps,
  state: _state,
  ...restProps
} = defineProps<AutoFormProps<S, T, N>>()

defineEmits<AutoFormEmits<S, T>>()
const _slots = defineSlots<AutoFormSlots<AutoFormStateType>>()
defineOptions({ inheritAttrs: false })

const state = ref(_state || {}) as Ref<AutoFormStateType>

const formRef = useTemplateRef('formRef')
const { DEFAULT_CONTROLS } = useAutoForm()
const { resolveFieldProp } = useAutoFormProvider(state, _slots)

// 提取纯净的数据 schema（去除所有布局标记）
const pureSchema = computed(() => schema ? extractPureSchema(schema) as S : schema)

const controlsMapping = computed(() => ({
  ...DEFAULT_CONTROLS,
  ...controls
}))

const fields = computed(() => {
  if (!schema)
    return []

  const items = introspectSchema(schema, controlsMapping.value, '', globalMeta)
  return items
})

function resolveDefaultValue(fields: AutoFormField[], stateValue: AutoFormStateType) {
  if (!fields.length)
    return

  const updates: Array<{ path: string, value: any }> = []

  function collectDefaultValues(fieldList: AutoFormField[]) {
    for (const field of fieldList) {
      if (field?.decorators?.defaultValue !== undefined
        && getPath(stateValue, field.path) === undefined) {
        updates.push({
          path: field.path,
          value: field.decorators.defaultValue
        })
      }

      if (field?.children && Array.isArray(field.children) && field.children.length > 0) {
        collectDefaultValues(field.children)
      }
    }
  }

  collectDefaultValues(fields)

  if (updates.length > 0) {
    for (const { path, value } of updates) {
      setPath(stateValue, path, value)
    }
  }
}

const visibleFields = computed(() =>
  fields.value.filter(field =>
    field && (field.meta?.if === undefined || resolveFieldProp<boolean>(field, 'if') === true)
  )
)

const renderData = computed(() => {
  if (!fields.value.length) return null

  const classified = classifyFields(visibleFields.value)

  return {
    ...classified,
    flatFields: classified.hasComplexFields ? [] : classified.leafFields,
    allFields: visibleFields.value
  }
})

onMounted(() => {
  resolveDefaultValue(fields.value, state.value)
})

/**
 * 重置表单到初始状态（包含默认值）
 */
function reset() {
  // 清空现有数据
  Object.keys(state.value).forEach((key) => {
    // eslint-disable-next-line @typescript-eslint/no-dynamic-delete
    delete state.value[key as keyof AutoFormStateType]
  })

  if (_state) {
    Object.assign(state.value, _state)
  }
  resolveDefaultValue(fields.value, state.value)

  formRef.value?.clear()
}

/**
 * 清空表单所有字段
 */
function clear() {
  Object.keys(state.value).forEach((key) => {
    // eslint-disable-next-line @typescript-eslint/no-dynamic-delete
    delete state.value[key as keyof AutoFormStateType]
  })

  formRef.value?.clear()
}

defineExpose({
  formRef,
  reset,
  clear
})
</script>

<template>
  <UForm
    v-if="renderData"
    ref="formRef"
    :state="state"
    :schema="pureSchema"
    v-bind="restProps"
  >
    <template #default="{ errors, loading }">
      <slot name="header" v-bind="{ errors, loading, fields: visibleFields, state }" />

      <template v-if="renderData.hasComplexFields">
        <template v-for="field in renderData.allFields" :key="field.path">
          <AutoFormRendererField
            v-if="renderData.leafFields.includes(field)"
            :field="field"
            :schema="schema"
            :extra-props="{ errors, loading }"
          />
          <AutoFormRendererArray
            v-else-if="renderData.arrayFields.includes(field)"
            :field="field"
            :schema="schema"
            :extra-props="{ errors, loading }"
            :add-button-props="addButtonProps"
          />
          <AutoFormRendererLayout
            v-else-if="renderData.layoutFields.includes(field)"
            :field="field"
            :schema="schema"
            :extra-props="{ errors, loading }"
          />
          <AutoFormRendererNested
            v-else
            :field="field"
            :schema="schema"
            :extra-props="{ errors, loading }"
          />
        </template>
      </template>

      <template v-else>
        <AutoFormRendererField
          v-for="field in renderData.flatFields"
          :key="field.path"
          :field="field"
          :schema="schema"
          :extra-props="{ errors, loading }"
        />
      </template>

      <slot name="footer" v-bind="{ errors, loading, fields: visibleFields, state }" />

      <slot name="submit" v-bind="{ errors, loading, fields: visibleFields, state }">
        <UButton
          v-if="submitButton"
          type="submit"
          :loading="loading"
          label="提交"
          loading-auto
          v-bind="submitButtonProps"
        />
      </slot>
    </template>
  </UForm>
</template>
