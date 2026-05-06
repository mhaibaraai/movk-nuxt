<script lang="ts">
import type { z } from 'zod'
import type { AutoFormField } from '../../types/auto-form'
import type { AnyObject } from '@movk/core'
import type { AutoFormProps } from '../../types/auto-form/component'

interface AutoFormRendererChildrenProps<S extends z.ZodObject> extends Pick<AutoFormProps<S>, 'schema'> {
  fields: AutoFormField[]
  extraProps?: AnyObject
}
</script>

<script lang="ts" setup generic="S extends z.ZodObject">
import { computed } from 'vue'
import { classifyFields } from '../../domains/auto-form/fields'
import AutoFormRendererField from './AutoFormRendererField.vue'
import AutoFormRendererArray from './AutoFormRendererArray.vue'
import AutoFormRendererLayout from './AutoFormRendererLayout.vue'
import AutoFormRendererNested from './AutoFormRendererNested.vue'

const { fields, schema, extraProps } = defineProps<AutoFormRendererChildrenProps<S>>()

const fieldTypeMap = computed(() => {
  const { leafFields, arrayFields, layoutFields } = classifyFields(fields)
  const map = new Map<AutoFormField, 'leaf' | 'array' | 'layout' | 'nested'>()

  for (const f of leafFields) map.set(f, 'leaf')
  for (const f of arrayFields) map.set(f, 'array')
  for (const f of layoutFields) map.set(f, 'layout')

  return map
})
</script>

<template>
  <template v-for="childField in fields" :key="childField.path">
    <AutoFormRendererField
      v-if="fieldTypeMap.get(childField) === 'leaf'"
      :field="childField"
      :schema="schema"
      :extra-props="extraProps"
    />
    <AutoFormRendererArray
      v-else-if="fieldTypeMap.get(childField) === 'array'"
      :field="childField"
      :schema="schema"
      :extra-props="extraProps"
    />
    <AutoFormRendererLayout
      v-else-if="fieldTypeMap.get(childField) === 'layout'"
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
