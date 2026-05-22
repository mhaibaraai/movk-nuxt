<script lang="ts" setup>
import { UFormField } from '#components'
import { computed } from 'vue'
import { useAutoFormInjector } from '../provider'
import { VNodeRender } from '../reactive'
import type { z } from 'zod'
import type { AnyObject } from '@movk/core'
import type { AutoFormField } from '../../../types'

interface AutoFormFieldProps {
  schema: z.ZodObject
  field: AutoFormField
  extraProps?: AnyObject
}

const props = defineProps<AutoFormFieldProps>()

const {
  resolveFieldProp,
  renderControl,
  createSlotResolver,
  createFormFieldSlots,
  createSlotProps
} = useAutoFormInjector()

const slotResolver = computed(() => createSlotResolver(props.field, props.extraProps))

const fieldProps = computed(() => ({
  hidden: resolveFieldProp(props.field, 'hidden', undefined, props.extraProps),
  as: resolveFieldProp(props.field, 'as', undefined, props.extraProps),
  name: resolveFieldProp(props.field, 'name', props.field.path, props.extraProps),
  errorPattern: resolveFieldProp(props.field, 'errorPattern', undefined, props.extraProps),
  label: resolveFieldProp(props.field, 'label', undefined, props.extraProps),
  description: resolveFieldProp(props.field, 'description', undefined, props.extraProps),
  help: resolveFieldProp(props.field, 'help', undefined, props.extraProps),
  error: resolveFieldProp(props.field, 'error', undefined, props.extraProps),
  hint: resolveFieldProp(props.field, 'hint', undefined, props.extraProps),
  size: resolveFieldProp(props.field, 'size', undefined, props.extraProps),
  required: resolveFieldProp(props.field, 'required', undefined, props.extraProps),
  eagerValidation: resolveFieldProp(props.field, 'eagerValidation', undefined, props.extraProps),
  validateOnInputDelay: resolveFieldProp(props.field, 'validateOnInputDelay', undefined, props.extraProps),
  orientation: resolveFieldProp(props.field, 'orientation', undefined, props.extraProps),
  class: resolveFieldProp(props.field, 'class', undefined, props.extraProps),
  ui: resolveFieldProp(props.field, 'ui', undefined, props.extraProps)
}))

const formFieldSlots = computed(() => createFormFieldSlots(props.field, slotResolver.value, props.extraProps))
const renderedControl = computed(() => renderControl(props.field, props.extraProps))
const defaultSlotProps = computed(() => createSlotProps(props.field, props.extraProps))
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
