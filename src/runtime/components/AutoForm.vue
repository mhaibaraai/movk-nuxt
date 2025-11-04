<script setup lang="ts" generic="S extends z.ZodObject, T extends boolean = true, N extends boolean = false">
import type { ButtonProps, FormEmits, FormProps, InferInput } from '@nuxt/ui'
import type { GlobalMeta, z } from 'zod/v4'
import type { AutoFormControls, AutoFormField, AutoFormSlotProps, DynamicFormSlots } from '../types/auto-form'
import { UForm } from '#components'
import type { Ref } from 'vue'
import { computed, onMounted, ref } from 'vue'
import { useAutoFormProvider } from '../composables/useAutoFormContext'
import { DEFAULT_CONTROLS } from '../constants/auto-form'
import { deepClone, getPath, setPath } from '../core'
import { introspectSchema, isLeafField } from '../utils/auto-form'
import AutoFormRendererArray from './auto-form-renderer/AutoFormRendererArray.vue'
import AutoFormRendererField from './auto-form-renderer/AutoFormRendererField.vue'
import AutoFormRendererNested from './auto-form-renderer/AutoFormRendererNested.vue'

export interface AutoFormProps<S extends z.ZodObject, T extends boolean = true, N extends boolean = false> extends FormProps<S, T, N> {
  /**
   * 是否显示默认提交按钮
   * @default true
   */
  submitButton?: boolean
  /** 自定义控件映射 */
  controls?: AutoFormControls
  /** 全局字段元数据配置 */
  globalMeta?: GlobalMeta
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
  addButtonProps,
  state: _state,
  ...restProps
} = defineProps<AutoFormProps<S, T, N>>()

defineEmits<AutoFormEmits<S, T>>()
const _slots = defineSlots<AutoFormSlots<AutoFormStateType>>()
defineOptions({ inheritAttrs: false })

const state = ref(_state || {}) as Ref<AutoFormStateType>

const { resolveFieldProp } = useAutoFormProvider(state, _slots)

const controlsMapping = computed(() => ({
  ...DEFAULT_CONTROLS,
  ...controls
}))

const fields = computed(() => {
  if (!schema)
    return []

  return introspectSchema(schema, controlsMapping.value, '', globalMeta)
})

function resolveDefaultValue(fields: AutoFormField[], stateValue: AutoFormStateType) {
  if (!fields.length)
    return

  // 批量收集需要设置的默认值
  const updates: Array<{ path: string, value: any }> = []

  for (const field of fields) {
    if (field?.decorators?.defaultValue !== undefined
      && getPath(stateValue, field.path) === undefined) {
      updates.push({
        path: field.path,
        value: deepClone(field.decorators.defaultValue)
      })
    }
  }

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
  const visibleFieldsArray = visibleFields.value
  const leafFields: AutoFormField[] = []
  const nestedFields: AutoFormField[] = []
  const arrayFields: AutoFormField[] = []

  // 单次遍历完成分类
  for (const field of visibleFieldsArray) {
    if (field.meta.type === 'array') {
      arrayFields.push(field)
    } else if (isLeafField(field)) {
      leafFields.push(field)
    } else {
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
    allFields: visibleFieldsArray
  }
})

onMounted(() => {
  resolveDefaultValue(fields.value, state.value)
})
</script>

<template>
  <UForm :state="state" :schema="schema" v-bind="restProps">
    <template #default="{ errors, loading }">
      <slot name="header" v-bind="{ errors, loading, fields: visibleFields, state }" />

      <template v-if="renderData.hasNestedFields">
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
          block
        />
      </slot>
    </template>
  </UForm>
</template>
