<script lang="ts" setup generic="S extends z.ZodObject, T extends boolean = true, N extends boolean = false">
import type { InferInput } from '@nuxt/ui'
import type { z } from 'zod'
import type { Ref } from 'vue'
import { UForm } from '#components'
import { computed, onMounted, ref, unref, useAttrs, useTemplateRef } from 'vue'
import { getPath, isFunction, setPath } from '@movk/core'
import { useAutoFormProvider } from '../domains/auto-form/provider'
import { classifyFields } from '../domains/auto-form/fields'
import { extractPureSchema, introspectSchema } from '../domains/auto-form/schema'
import { useAutoForm } from '../composables/useAutoForm'
import AutoFormRendererChildren from '../domains/auto-form/components/Children.vue'
import AutoFormRendererField from '../domains/auto-form/components/Field.vue'
import type { AutoFormProps, AutoFormEmits, AutoFormSlots } from '../types/auto-form/component'
import type { AutoFormField } from '../types/auto-form/slots'

type AutoFormStateType = N extends false ? Partial<InferInput<S>> : never

const props = withDefaults(defineProps<AutoFormProps<S, T, N>>(), {
  submitButton: true,
  loadingAuto: true,
  validateOn: () => []
})

defineEmits<AutoFormEmits<S, T>>()
const slots = defineSlots<AutoFormSlots<AutoFormStateType>>()
defineOptions({ inheritAttrs: false })

const attrs = useAttrs()

const stateModel = ref(props.state || {}) as Ref<AutoFormStateType>

const formRef = useTemplateRef('formRef')
const { DEFAULT_CONTROLS } = useAutoForm()
const { resolveFieldProp } = useAutoFormProvider(stateModel, slots)

const resolvedButtonSize = computed(() => {
  const size = props.globalMeta?.size
  if (size === undefined || isFunction(size)) return undefined
  return unref(size)
})

const pureSchema = computed(() => props.schema ? extractPureSchema(props.schema) as S : props.schema)

const controlsMapping = computed(() => ({
  ...DEFAULT_CONTROLS,
  ...props.controls
}))

const fields = computed(() => {
  if (!props.schema)
    return []

  return introspectSchema(props.schema, controlsMapping.value, '', props.globalMeta)
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
  resolveDefaultValue(fields.value, stateModel.value)
})

function reset() {
  Object.keys(stateModel.value).forEach((key) => {
    // eslint-disable-next-line @typescript-eslint/no-dynamic-delete
    delete stateModel.value[key as keyof AutoFormStateType]
  })

  if (props.state) {
    Object.assign(stateModel.value, props.state)
  }
  resolveDefaultValue(fields.value, stateModel.value)

  formRef.value?.clear()
}

function clear() {
  Object.keys(stateModel.value).forEach((key) => {
    // eslint-disable-next-line @typescript-eslint/no-dynamic-delete
    delete stateModel.value[key as keyof AutoFormStateType]
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
    :state="stateModel"
    :schema="pureSchema"
    :loading-auto="loadingAuto"
    :validate-on="validateOn"
    v-bind="attrs"
  >
    <template #default="{ errors, loading }">
      <slot name="header" v-bind="{ errors, loading, fields: visibleFields, state: stateModel }" />

      <template v-if="renderData.hasComplexFields">
        <AutoFormRendererChildren
          :fields="renderData.allFields"
          :schema="schema"
          :extra-props="{ errors, loading }"
        />
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

      <slot name="footer" v-bind="{ errors, loading, fields: visibleFields, state: stateModel }" />

      <slot name="submit" v-bind="{ errors, loading, fields: visibleFields, state: stateModel }">
        <UButton
          v-if="submitButton"
          type="submit"
          :loading="loading"
          label="提交"
          loading-auto
          block
          :size="resolvedButtonSize"
          v-bind="submitButtonProps"
        />
      </slot>
    </template>
  </UForm>
</template>
