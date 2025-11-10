<script setup lang="ts" generic="S extends z.ZodObject">
import type { AnyObject } from '@movk/core'
import type { z } from 'zod/v4'
import type { AutoFormField } from '../../types/auto-form'
import type { AutoFormProps } from '../AutoForm.vue'
import { UFormField } from '#components'
import { computed } from 'vue'
import { useAutoFormInjector } from '../../internal/useAutoFormProvider'
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
  createSlotProps
} = useAutoFormInjector()

const slotResolver = computed(() => createSlotResolver(field, extraProps))

const fieldProps = computed(() => ({
  hidden: resolveFieldProp(field, 'hidden', undefined, extraProps),
  as: resolveFieldProp(field, 'as', undefined, extraProps),
  name: resolveFieldProp(field, 'name', field.path, extraProps),
  errorPattern: resolveFieldProp(field, 'errorPattern', undefined, extraProps),
  label: resolveFieldProp(field, 'label', undefined, extraProps),
  description: resolveFieldProp(field, 'description', undefined, extraProps),
  help: resolveFieldProp(field, 'help', undefined, extraProps),
  error: resolveFieldProp(field, 'error', undefined, extraProps),
  hint: resolveFieldProp(field, 'hint', undefined, extraProps),
  size: resolveFieldProp(field, 'size', undefined, extraProps),
  required: resolveFieldProp(field, 'required', undefined, extraProps),
  eagerValidation: resolveFieldProp(field, 'eagerValidation', undefined, extraProps),
  validateOnInputDelay: resolveFieldProp(field, 'validateOnInputDelay', undefined, extraProps),
  class: resolveFieldProp(field, 'class', undefined, extraProps),
  ui: resolveFieldProp(field, 'ui', undefined, extraProps)
}))

const formFieldSlots = computed(() => createFormFieldSlots(field, slotResolver.value, extraProps))
const renderedControl = computed(() => renderControl(field, extraProps))
const defaultSlotProps = computed(() => createSlotProps(field, extraProps))
</script>

<template>
  <UFormField v-show="!fieldProps.hidden" v-bind="fieldProps">
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
