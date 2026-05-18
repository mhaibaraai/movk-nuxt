<script lang="ts" setup generic="S extends z.ZodObject, T extends boolean = true, N extends boolean = false">
import type { ComponentConfig, InferInput } from '@nuxt/ui'
import type { z } from 'zod'
import type { Ref } from 'vue'
import { UForm } from '#components'
import { computed, onMounted, ref, unref, useAttrs, useTemplateRef } from 'vue'
import { deepClone, getPath, isFunction, setPath } from '@movk/core'
import { useAutoFormProvider } from '../domains/auto-form/provider'
import { classifyFields } from '../domains/auto-form/fields'
import { extractPureSchema, introspectSchema } from '../domains/auto-form/schema'
import { useAutoForm } from '../composables/useAutoForm'
import AutoFormRendererChildren from '../domains/auto-form/components/Children.vue'
import AutoFormRendererField from '../domains/auto-form/components/Field.vue'
import type { AutoFormProps, AutoFormEmits, AutoFormSlots } from '../types/auto-form/component'
import type { AutoFormField } from '../types/auto-form/slots'
import { useExtendedTv } from '../utils/extend-theme'
import theme from '#build/movk-ui/auto-form'
import type { AppConfig } from 'nuxt/schema'
import { useAppConfig } from '#imports'

type AutoFormStateType = N extends false ? Partial<InferInput<S>> : never

interface _Props extends AutoFormProps<S, T, N> {
  ui?: ComponentConfig<typeof theme, AppConfig, 'autoForm'>['slots']
}

const props = withDefaults(defineProps<_Props>(), {
  submit: true,
  loadingAuto: true,
  validateOn: () => []
})

const emits = defineEmits<AutoFormEmits>()
const slots = defineSlots<AutoFormSlots<AutoFormStateType>>()
defineOptions({ inheritAttrs: false })

const attrs = useAttrs()

const appConfig = useAppConfig() as { movk?: { autoForm?: unknown } }

const initialState = deepClone(props.state ?? {}) as AutoFormStateType
const stateModel = ref(deepClone(initialState)) as Ref<AutoFormStateType>
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

const { extendUi } = useExtendedTv(
  { slots: {} },
  theme,
  () => appConfig.movk?.autoForm,
  () => ({
    ui: props.ui
  })
)

function reset() {
  stateModel.value = deepClone(initialState)
  resolveDefaultValue(fields.value, stateModel.value)
  formRef.value?.clear()
}

function clear() {
  stateModel.value = {} as AutoFormStateType
  formRef.value?.clear()
}

onMounted(() => {
  resolveDefaultValue(fields.value, stateModel.value)
})

defineExpose({
  formRef,
  reset,
  clear
})
</script>

<template>
  <div :class="extendUi.base">
    <UTheme
      :ui="{
        form: { base: extendUi.body },
        collapsible: { content: extendUi.group }
      }"
    >
      <UForm
        v-if="renderData"
        ref="formRef"
        :state="stateModel"
        :schema="pureSchema"
        :loading-auto="props.loadingAuto"
        :validate-on="props.validateOn"
        data-slot="form"
        v-bind="attrs"
        @error="emits('error', $event)"
      >
        <template #default="{ errors, loading }">
          <div v-if="$slots.header" :class="extendUi.header">
            <slot name="header" v-bind="{ errors, loading, fields: visibleFields, state: stateModel }" />
          </div>

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

          <div v-if="$slots.footer" :class="extendUi.footer">
            <slot name="footer" v-bind="{ errors, loading, fields: visibleFields, state: stateModel }" />
          </div>

          <div v-if="props.submit" :class="extendUi.actions">
            <slot name="submit" v-bind="{ errors, loading, fields: visibleFields, state: stateModel }">
              <UButton
                type="submit"
                label="提交"
                block
                :loading="loading"
                :loading-auto="props.loadingAuto"
                :size="resolvedButtonSize"
                :disabled="attrs.disabled as boolean"
                v-bind="props.submitButtonProps"
              />
            </slot>
          </div>
        </template>
      </UForm>
    </UTheme>
  </div>
</template>
