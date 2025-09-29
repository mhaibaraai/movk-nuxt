<script setup lang="ts" generic="S extends z.ZodObject">
import type { AnyObject } from '@movk/core'
import type { z } from 'zod/v4'
import type { AutoFormField } from '../../types/auto-form'
import type { AutoFormProps } from './AutoForm.vue'
import { UFormField } from '#components'
import { computed } from 'vue'
import { useAutoFormInjector } from '../../composables/useAutoFormContext'
import { VNodeRender } from '../../utils/auto-form'

interface AutoFormFieldProps<S extends z.ZodObject> extends Pick<AutoFormProps<S>, 'schema'> {
  field: AutoFormField
  extraProps?: AnyObject
}

const { field, extraProps } = defineProps<AutoFormFieldProps<S>>()

const {
  resolveFieldProp,
  renderControl,
  createSlotResolver,
  createFormFieldSlots,
  createSlotProps,
} = useAutoFormInjector()

const slotResolver = computed(() => createSlotResolver(field))

const fieldProps = computed(() => ({
  hidden: resolveFieldProp(field, 'hidden'),
  as: resolveFieldProp(field, 'as'),
  name: resolveFieldProp(field, 'name', field.path),
  errorPattern: resolveFieldProp(field, 'errorPattern'),
  label: resolveFieldProp(field, 'label'),
  description: resolveFieldProp(field, 'description'),
  help: resolveFieldProp(field, 'help'),
  error: resolveFieldProp(field, 'error'),
  hint: resolveFieldProp(field, 'hint'),
  size: resolveFieldProp(field, 'size'),
  required: resolveFieldProp(field, 'required'),
  eagerValidation: resolveFieldProp(field, 'eagerValidation'),
  validateOnInputDelay: resolveFieldProp(field, 'validateOnInputDelay'),
  class: resolveFieldProp(field, 'class'),
  ui: resolveFieldProp(field, 'ui'),
}))

const formFieldSlots = computed(() =>
  createFormFieldSlots(field, slotResolver.value, extraProps),
)
const renderedControl = computed(() => renderControl(field))
const defaultSlotProps = computed(() =>
  createSlotProps(field, { ...extraProps }),
)
</script>

<template>
  <UFormField
    v-show="!fieldProps.hidden"
    :as="fieldProps.as"
    :name="fieldProps.name"
    :error-pattern="fieldProps.errorPattern"
    :label="fieldProps.label"
    :description="fieldProps.description"
    :help="fieldProps.help"
    :error="fieldProps.error"
    :hint="fieldProps.hint"
    :size="fieldProps.size"
    :required="fieldProps.required"
    :eager-validation="fieldProps.eagerValidation"
    :validate-on-input-delay="fieldProps.validateOnInputDelay"
    :class="fieldProps.class"
    :ui="fieldProps.ui"
  >
    <template v-for="(slotComponent, slotName) in formFieldSlots" :key="slotName" #[slotName]="slotData">
      <VNodeRender :node="slotComponent(slotData)" />
    </template>

    <template #default="{ error }">
      <VNodeRender
        v-if="slotResolver.hasSlot('default')"
        :node="slotResolver.renderSlot('default', { ...defaultSlotProps, error })"
      />
      <VNodeRender v-else :node="renderedControl" />
    </template>
  </UFormField>
</template>
