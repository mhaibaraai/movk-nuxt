<script setup lang="ts" generic="S extends z.ZodObject">
import type { AnyObject } from '@movk/core'
import type { z } from 'zod/v4'
import type { AutoFormField } from '../../types/auto-form'
import type { AutoFormProps } from '../AutoForm.vue'
import { UCollapsible } from '#components'
import { computed, defineAsyncComponent } from 'vue'
import { useAutoFormInjector } from '../../internal/useAutoFormProvider'
import { classifyFields, isLeafField, VNodeRender } from '../../utils/auto-form'
import AutoFormRendererArray from './AutoFormRendererArray.vue'
import AutoFormRendererField from './AutoFormRendererField.vue'

const AutoFormRendererLayout = defineAsyncComponent(() =>
  import('./AutoFormRendererLayout.vue')
)

interface AutoFormRendererNestedProps<S extends z.ZodObject> extends Pick<AutoFormProps<S>, 'schema'> {
  field: AutoFormField
  extraProps?: AnyObject
}

const {
  field,
  schema,
  extraProps
} = defineProps<AutoFormRendererNestedProps<S>>()

const { createSlotResolver, createSlotProps, createCollapsibleEnhancer } = useAutoFormInjector()

const childEntries = computed(() => {
  if (isLeafField(field) || !field.children?.length) {
    return {
      leafFields: [],
      nestedFields: [],
      arrayFields: [],
      layoutFields: [],
      hasComplexFields: false
    }
  }

  return classifyFields(field.children)
})

const slotResolver = computed(() => createSlotResolver(field, extraProps))

const { collapsibleConfig, shouldShowCollapsible, isHidden, enhancedField } = createCollapsibleEnhancer(field, extraProps)

const slotProps = computed(() => createSlotProps(field, extraProps))
</script>

<template>
  <UCollapsible v-show="!isHidden" v-if="shouldShowCollapsible" v-bind="collapsibleConfig || {}">
    <template #default="{ open }">
      <AutoFormRendererField :field="enhancedField" :schema="schema" :extra-props="{ ...extraProps, open }" />
    </template>
    <template #content>
      <VNodeRender v-if="slotResolver.hasSlot('content')" :node="slotResolver.renderSlot('content', slotProps)" />
      <template v-else>
        <AutoFormRendererField
          v-for="childField in childEntries.leafFields"
          :key="childField.path"
          :field="childField"
          :schema="schema"
          :extra-props="extraProps"
        />

        <AutoFormRendererArray
          v-for="childField in childEntries.arrayFields"
          :key="childField.path"
          :field="childField"
          :schema="schema"
          :extra-props="extraProps"
        />

        <AutoFormRendererLayout
          v-for="childField in childEntries.layoutFields"
          :key="childField.path"
          :field="childField"
          :schema="schema"
          :extra-props="extraProps"
        />

        <AutoFormRendererNested
          v-for="childField in childEntries.nestedFields"
          :key="childField.path"
          :field="childField"
          :schema="schema"
          :extra-props="extraProps"
        />
      </template>
    </template>
  </UCollapsible>

  <template v-else>
    <AutoFormRendererField
      v-for="childField in childEntries.leafFields"
      :key="childField.path"
      :field="childField"
      :schema="schema"
      :extra-props="extraProps"
    />

    <AutoFormRendererArray
      v-for="childField in childEntries.arrayFields"
      :key="childField.path"
      :field="childField"
      :schema="schema"
      :extra-props="extraProps"
    />

    <AutoFormRendererLayout
      v-for="childField in childEntries.layoutFields"
      :key="childField.path"
      :field="childField"
      :schema="schema"
      :extra-props="extraProps"
    />

    <AutoFormRendererNested
      v-for="childField in childEntries.nestedFields"
      :key="childField.path"
      :field="childField"
      :schema="schema"
      :extra-props="extraProps"
    />
  </template>
</template>
