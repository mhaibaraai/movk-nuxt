<script lang="ts" setup>
import { UCollapsible } from '#components'
import { computed } from 'vue'
import { useAutoFormInjector } from '../provider'
import { isLeafField } from '../fields'
import { VNodeRender } from '../reactive'
import AutoFormRendererField from './Field.vue'
import AutoFormRendererChildren from './Children.vue'
import type { z } from 'zod'
import type { AutoFormField } from '../../../types'
import type { AnyObject } from '@movk/core'

interface AutoFormRendererNestedProps {
  schema: z.ZodObject
  field: AutoFormField
  extraProps?: AnyObject
}

const props = defineProps<AutoFormRendererNestedProps>()

const { createSlotResolver, createSlotProps, createCollapsibleEnhancer, resolveFieldProp } = useAutoFormInjector()

const visibleFields = computed(() => {
  if (isLeafField(props.field) || !props.field.children?.length) {
    return []
  }
  return props.field.children.filter(f =>
    f && (f.meta?.if === undefined || resolveFieldProp<boolean>(f, 'if') === true)
  )
})

const slotResolver = computed(() => createSlotResolver(props.field, props.extraProps))

const { collapsibleConfig, shouldShowCollapsible, isHidden, enhancedField } = createCollapsibleEnhancer(props.field, props.extraProps)

const slotProps = computed(() => createSlotProps(props.field, props.extraProps))
</script>

<template>
  <UCollapsible v-if="shouldShowCollapsible && visibleFields.length" v-show="!isHidden" v-bind="collapsibleConfig || {}">
    <template #default="{ open }">
      <AutoFormRendererField :field="enhancedField" :schema="props.schema" :extra-props="{ ...props.extraProps, open }" />
    </template>
    <template #content>
      <VNodeRender v-if="slotResolver.hasSlot('before')" :node="slotResolver.renderSlot('before', slotProps)" />
      <VNodeRender v-if="slotResolver.hasSlot('content')" :node="slotResolver.renderSlot('content', slotProps)" />
      <AutoFormRendererChildren v-else :fields="visibleFields" :schema="props.schema" :extra-props="props.extraProps" />
      <VNodeRender v-if="slotResolver.hasSlot('after')" :node="slotResolver.renderSlot('after', slotProps)" />
    </template>
  </UCollapsible>

  <AutoFormRendererChildren
    v-else-if="visibleFields.length"
    :fields="visibleFields"
    :schema="props.schema"
    :extra-props="props.extraProps"
  />
</template>
