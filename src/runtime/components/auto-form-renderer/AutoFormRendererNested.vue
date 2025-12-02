<script setup lang="ts" generic="S extends z.ZodObject">
import type { z } from 'zod/v4'
import type { AutoFormField } from '../../types/auto-form'
import type { AutoFormRendererNestedProps } from '../../types/auto-form-renderer'
import { UCollapsible } from '#components'
import { computed, defineAsyncComponent } from 'vue'
import { useAutoFormInjector } from '../../internal/useAutoFormProvider'
import { classifyFields, isLeafField, VNodeRender } from '../../utils/auto-form'
import AutoFormRendererArray from './AutoFormRendererArray.vue'
import AutoFormRendererField from './AutoFormRendererField.vue'

const AutoFormRendererLayout = defineAsyncComponent(() =>
  import('./AutoFormRendererLayout.vue')
)

const {
  field,
  schema,
  extraProps
} = defineProps<AutoFormRendererNestedProps<S>>()

const { createSlotResolver, createSlotProps, createCollapsibleEnhancer, resolveFieldProp } = useAutoFormInjector()

const renderData = computed(() => {
  if (isLeafField(field) || !field.children?.length) {
    return null
  }
  const visibleFields = field.children.filter(f =>
    f && (f.meta?.if === undefined || resolveFieldProp<boolean>(f, 'if') === true)
  )

  const classified = classifyFields(visibleFields)
  return {
    ...classified,
    allFields: visibleFields
  }
})

const slotResolver = computed(() => createSlotResolver(field, extraProps))

const { collapsibleConfig, shouldShowCollapsible, isHidden, enhancedField } = createCollapsibleEnhancer(field, extraProps)

const slotProps = computed(() => createSlotProps(field, extraProps))
</script>

<template>
  <UCollapsible v-if="shouldShowCollapsible && renderData" v-show="!isHidden" v-bind="collapsibleConfig || {}">
    <template #default="{ open }">
      <AutoFormRendererField :field="enhancedField" :schema="schema" :extra-props="{ ...extraProps, open }" />
    </template>
    <template #content>
      <VNodeRender v-if="slotResolver.hasSlot('before')" :node="slotResolver.renderSlot('before', slotProps)" />
      <VNodeRender v-if="slotResolver.hasSlot('content')" :node="slotResolver.renderSlot('content', slotProps)" />
      <template v-else>
        <template v-for="childField in renderData.allFields" :key="childField.path">
          <AutoFormRendererField
            v-if="renderData.leafFields.includes(childField)"
            :field="childField"
            :schema="schema"
            :extra-props="extraProps"
          />
          <AutoFormRendererArray
            v-else-if="renderData.arrayFields.includes(childField)"
            :field="childField"
            :schema="schema"
            :extra-props="extraProps"
          />
          <AutoFormRendererLayout
            v-else-if="renderData.layoutFields.includes(childField)"
            :field="childField"
            :schema="schema"
            :extra-props="extraProps"
          />
          <AutoFormRendererNested
            v-else
            :field="childField"
            :schema="schema"
            :extra-props="extraProps"
          />
        </template>
      </template>
      <VNodeRender v-if="slotResolver.hasSlot('after')" :node="slotResolver.renderSlot('after', slotProps)" />
    </template>
  </UCollapsible>

  <template v-else-if="renderData">
    <template v-for="childField in renderData.allFields" :key="childField.path">
      <AutoFormRendererField
        v-if="renderData.leafFields.includes(childField)"
        :field="childField"
        :schema="schema"
        :extra-props="extraProps"
      />
      <AutoFormRendererArray
        v-else-if="renderData.arrayFields.includes(childField)"
        :field="childField"
        :schema="schema"
        :extra-props="extraProps"
      />
      <AutoFormRendererLayout
        v-else-if="renderData.layoutFields.includes(childField)"
        :field="childField"
        :schema="schema"
        :extra-props="extraProps"
      />
      <AutoFormRendererNested
        v-else
        :field="childField"
        :schema="schema"
        :extra-props="extraProps"
      />
    </template>
  </template>
</template>
