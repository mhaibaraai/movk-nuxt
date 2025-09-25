<script setup lang="ts" generic="S extends z.ZodObject">
import type { z } from 'zod/v4'
import type { AutoFormField } from '../../types/auto-form'
import type { AutoFormProps } from './AutoForm.vue'
import { UCollapsible } from '#components'
import { computed } from 'vue'
import { useAutoFormInjector } from '../../composables/useAutoFormContext'
import { isLeafField, VNodeRender } from '../../utils/auto-form'
import AutoFormFieldRenderer from './AutoFormFieldRenderer.vue'

interface AutoFormNestedRendererProps<S extends z.ZodObject> extends Pick<AutoFormProps<S>, 'schema'> {
  field: AutoFormField
}

const {
  field,
  schema,
} = defineProps<AutoFormNestedRendererProps<S>>()

const { resolveFieldProp, createSlotResolver, createSlotProps } = useAutoFormInjector()

const slotResolver = createSlotResolver(field)

const isHidden = computed(() => resolveFieldProp<boolean | undefined>(field, 'hidden', false))

const childEntries = computed(() => {
  if (isLeafField(field) || !field.children?.length)
    return []

  return field.children.map(childField => ({
    field: childField,
    isLeaf: isLeafField(childField),
  }))
})

const collapsibleConfig = computed(() => resolveFieldProp(field, 'collapsible'))
const useCollapsible = computed(() => {
  const config = collapsibleConfig.value?.enabled
  if (!config)
    return true
  return config.enabled === true
})
</script>

<template>
  <UCollapsible v-show="!isHidden" v-if="useCollapsible" v-bind="collapsibleConfig">
    <template #default="{ open }">
      <AutoFormFieldRenderer :field="field" :schema="schema" :extra-props="{ open }" />
    </template>
    <template #content>
      <VNodeRender
        v-if="slotResolver.hasSlot('content')"
        :node="slotResolver.renderSlot('content', createSlotProps(field))"
      />
      <template v-else>
        <template v-for="childEntry in childEntries" :key="childEntry.field.path">
          <AutoFormFieldRenderer v-if="childEntry.isLeaf" :field="childEntry.field" :schema="schema" />
          <AutoFormNestedRenderer v-else :field="childEntry.field" :schema="schema" />
        </template>
      </template>
    </template>
  </UCollapsible>

  <template v-else>
    <template v-for="childEntry in childEntries" :key="childEntry.field.path">
      <AutoFormFieldRenderer v-if="childEntry.isLeaf" :field="childEntry.field" :schema="schema" />
      <AutoFormNestedRenderer v-else :field="childEntry.field" :schema="schema" />
    </template>
  </template>
</template>
