<script lang="ts" setup generic="S extends z.ZodObject, T extends boolean = true, N extends boolean = false">
import type { ComponentConfig, FormState, InferInput } from '@nuxt/ui'
import type { z } from 'zod'
import { UForm } from '#components'
import { computed, ref, useAttrs, useTemplateRef } from 'vue'
import { classifyFields } from '../domains/auto-form/fields'
import { useAutoFormCore } from '../domains/auto-form/useAutoFormCore'
import AutoFormRendererChildren from '../domains/auto-form/components/Children.vue'
import AutoFormRendererField from '../domains/auto-form/components/Field.vue'
import type { AutoFormProps, AutoFormEmits, AutoFormSlots } from '../types/auto-form/component'
import { useExtendedTv } from '../utils/extend-theme'
import { useMovkLocale } from '../composables/useMovkLocale'
import theme from '#build/movk-ui/auto-form'
import type { AppConfig } from 'nuxt/schema'
import { useAppConfig } from '#imports'

type AutoFormStateType = N extends false ? Partial<InferInput<S>> : never

const props = withDefaults(defineProps<AutoFormProps<S, T, N> & {
  ui?: ComponentConfig<typeof theme, AppConfig, 'autoForm'>['slots']
}>(), {
  submit: true,
  loadingAuto: true,
  validateOn: () => []
})

const modelValue = defineModel<AutoFormStateType>()
const emits = defineEmits<AutoFormEmits<S>>()
const slots = defineSlots<AutoFormSlots<AutoFormStateType>>()
defineOptions({ inheritAttrs: false })

const attrs = useAttrs()
const { t } = useMovkLocale()
const appConfig = useAppConfig() as { movk?: { autoForm?: unknown } }

if (import.meta.dev && props.state !== undefined) {
  console.warn('[AutoForm] The `state` prop is deprecated, use `v-model` instead.')
}

const localState = ref<Record<string, any>>({})
const stateModel = computed(() => (modelValue.value ?? props.state ?? localState.value) as Record<string, any>)

const formRef = useTemplateRef('formRef')

const core = useAutoFormCore({
  schema: () => props.schema,
  controls: () => props.controls,
  globalMeta: () => props.globalMeta,
  hiddenValue: () => props.hiddenValue,
  model: stateModel,
  slots,
  addButtonProps: () => props.addButtonProps
})
const { visibleFields, validationSchema, resolvedButtonSize } = core

const renderData = computed(() => {
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
    ui: {
      ...props.ui,
      root: [props.ui?.root, props.class]
    }
  })
)

function reset() {
  const next = core.reset()
  formRef.value?.clear()
  emits('reset', next as Partial<z.input<S>>)
}

function clear() {
  const next = core.clear()
  formRef.value?.clear()
  emits('clear', next as Partial<z.input<S>>)
}

const submit = async () => formRef.value?.submit()
const validate = ((...args: Parameters<NonNullable<typeof formRef.value>['validate']>) =>
  formRef.value?.validate(...args)) as NonNullable<typeof formRef.value>['validate']

defineExpose({
  formRef,
  submit,
  validate,
  reset,
  clear,
  setBaseline: core.setBaseline,
  isDirty: core.isDirty,
  dirtyFields: core.dirtyFields,
  getFieldValue: core.getFieldValue,
  setFieldValue: core.setFieldValue
})
</script>

<template>
  <div :class="extendUi.root" data-slot="root">
    <UTheme
      :ui="{
        collapsible: { content: extendUi.collapsible }
      }"
    >
      <UForm
        ref="formRef"
        :state="stateModel as FormState<S>"
        :schema="validationSchema as S"
        :loading-auto="props.loadingAuto"
        :validate-on="props.validateOn"
        data-slot="form"
        v-bind="attrs"
        :on-submit="props.onSubmit"
        :ui="{
          base: extendUi.base
        }"
        @error="emits('error', $event)"
      >
        <template #default="{ errors, loading: submitting }">
          <div v-if="$slots.header" :class="extendUi.header" data-slot="header">
            <slot name="header" v-bind="{ errors, loading: props.loading || submitting, fields: visibleFields, state: stateModel as AutoFormStateType }" />
          </div>

          <template v-if="renderData.hasComplexFields">
            <AutoFormRendererChildren
              :fields="renderData.allFields"
              :extra-props="{ errors, loading: props.loading || submitting }"
            />
          </template>

          <template v-else>
            <AutoFormRendererField
              v-for="field in renderData.flatFields"
              :key="field.path"
              :field="field"
              :extra-props="{ errors, loading: props.loading || submitting }"
            />
          </template>

          <div v-if="$slots.footer" :class="extendUi.footer" data-slot="footer">
            <slot name="footer" v-bind="{ errors, loading: props.loading || submitting, fields: visibleFields, state: stateModel as AutoFormStateType }" />
          </div>

          <div v-if="props.submit" :class="extendUi.actions" data-slot="submit">
            <slot name="submit" v-bind="{ errors, loading: props.loading || submitting, fields: visibleFields, state: stateModel as AutoFormStateType }">
              <UButton
                type="submit"
                :label="t('autoForm.submit')"
                block
                :loading="props.loading || submitting"
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
