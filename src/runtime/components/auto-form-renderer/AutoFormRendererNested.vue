<script lang="ts">
import type { z } from 'zod'
import type { AutoFormProps } from '../AutoForm.vue'
import type { AutoFormField } from '../../types'
import type { AnyObject } from '@movk/core'

interface AutoFormRendererNestedProps<S extends z.ZodObject> extends Pick<AutoFormProps<S>, 'schema'> {
  field: AutoFormField
  extraProps?: AnyObject
}
</script>

<script lang="ts" setup generic="S extends z.ZodObject">
import { UCollapsible } from '#components'
import { computed } from 'vue'
import { useAutoFormInjector } from '../../domains/auto-form/provider'
import { isLeafField } from '../../domains/auto-form/fields'
import { VNodeRender } from '../../domains/auto-form/reactive'
import AutoFormRendererField from './AutoFormRendererField.vue'
import AutoFormRendererChildren from './AutoFormRendererChildren.vue'

const {
  field,
  schema,
  extraProps
} = defineProps<AutoFormRendererNestedProps<S>>()

const { createSlotResolver, createSlotProps, createCollapsibleEnhancer, resolveFieldProp } = useAutoFormInjector()

const visibleFields = computed(() => {
  if (isLeafField(field) || !field.children?.length) {
    return []
  }
  return field.children.filter(f =>
    f && (f.meta?.if === undefined || resolveFieldProp<boolean>(f, 'if') === true)
  )
})

const slotResolver = computed(() => createSlotResolver(field, extraProps))

const { collapsibleConfig, shouldShowCollapsible, isHidden, enhancedField } = createCollapsibleEnhancer(field, extraProps)

const slotProps = computed(() => createSlotProps(field, extraProps))
</script>

<template>
  <UCollapsible v-if="shouldShowCollapsible && visibleFields.length" v-show="!isHidden" v-bind="collapsibleConfig || {}">
    <template #default="{ open }">
      <AutoFormRendererField :field="enhancedField" :schema="schema" :extra-props="{ ...extraProps, open }" />
    </template>
    <template #content>
      <VNodeRender v-if="slotResolver.hasSlot('before')" :node="slotResolver.renderSlot('before', slotProps)" />
      <VNodeRender v-if="slotResolver.hasSlot('content')" :node="slotResolver.renderSlot('content', slotProps)" />
      <AutoFormRendererChildren v-else :fields="visibleFields" :schema="schema" :extra-props="extraProps" />
      <VNodeRender v-if="slotResolver.hasSlot('after')" :node="slotResolver.renderSlot('after', slotProps)" />
    </template>
  </UCollapsible>

  <AutoFormRendererChildren
    v-else-if="visibleFields.length"
    :fields="visibleFields"
    :schema="schema"
    :extra-props="extraProps"
  />
</template>
