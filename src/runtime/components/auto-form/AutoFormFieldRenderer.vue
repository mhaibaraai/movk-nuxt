<script setup lang="ts" generic="S extends z.ZodObject">
import type { AnyObject } from '@movk/core'
import type { z } from 'zod/v4'
import type { AutoFormField } from '../../types/auto-form'
import type { AutoFormProps } from './AutoForm.vue'
import { UFormField } from '#components'
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

const slotResolver = createSlotResolver(field)
</script>

<template>
  <UFormField
    v-show="!resolveFieldProp(field, 'hidden')"
    :name="resolveFieldProp(field, 'name', field.path)"
    :as="resolveFieldProp(field, 'as')"
    :error-pattern="resolveFieldProp(field, 'errorPattern')"
    :label="resolveFieldProp(field, 'label')"
    :description="resolveFieldProp(field, 'description')"
    :help="resolveFieldProp(field, 'help')"
    :hint="resolveFieldProp(field, 'hint')"
    :size="resolveFieldProp(field, 'size')"
    :required="resolveFieldProp(field, 'required')"
    :eager-validation="resolveFieldProp(field, 'eagerValidation')"
    :validate-on-input-delay="resolveFieldProp(field, 'validateOnInputDelay')"
    :class="resolveFieldProp(field, 'class')"
    :ui="resolveFieldProp(field, 'ui')"
  >
    <template
      v-for="(slotComponent, slotName) in createFormFieldSlots(field, slotResolver, extraProps)"
      :key="slotName"
      #[slotName]="slotData"
    >
      <VNodeRender :node="slotComponent(slotData)" />
    </template>

    <template #default="{ error }">
      <VNodeRender
        v-if="slotResolver.hasSlot('default')"
        :node="slotResolver.renderSlot('default', createSlotProps(field, { error, ...extraProps }))"
      />
      <VNodeRender v-else :node="renderControl(field)" />
    </template>
  </UFormField>
</template>
