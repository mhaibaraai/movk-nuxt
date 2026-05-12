<script lang="ts" setup generic="S extends z.ZodObject">
import { computed } from 'vue'
import { classifyFields } from '../fields'
import AutoFormRendererField from './Field.vue'
import AutoFormRendererArray from './Array.vue'
import AutoFormRendererLayout from './Layout.vue'
import AutoFormRendererNested from './Nested.vue'
import type { z } from 'zod'
import type { AutoFormField } from '../../../types/auto-form'
import type { AnyObject } from '@movk/core'
import type { AutoFormProps } from '../../../types/auto-form/component'

interface AutoFormRendererChildrenProps<S extends z.ZodObject> extends Pick<AutoFormProps<S>, 'schema'> {
  fields: AutoFormField[]
  extraProps?: AnyObject
}

const props = defineProps<AutoFormRendererChildrenProps<S>>()

const fieldTypeMap = computed(() => {
  const { leafFields, arrayFields, layoutFields } = classifyFields(props.fields)
  const map = new Map<AutoFormField, 'leaf' | 'array' | 'layout' | 'nested'>()

  for (const f of leafFields) map.set(f, 'leaf')
  for (const f of arrayFields) map.set(f, 'array')
  for (const f of layoutFields) map.set(f, 'layout')

  return map
})
</script>

<template>
  <template v-for="childField in props.fields" :key="childField.path">
    <AutoFormRendererField
      v-if="fieldTypeMap.get(childField) === 'leaf'"
      :field="childField"
      :schema="props.schema"
      :extra-props="props.extraProps"
    />
    <AutoFormRendererArray
      v-else-if="fieldTypeMap.get(childField) === 'array'"
      :field="childField"
      :schema="props.schema"
      :extra-props="props.extraProps"
    />
    <AutoFormRendererLayout
      v-else-if="fieldTypeMap.get(childField) === 'layout'"
      :field="childField"
      :schema="props.schema"
      :extra-props="props.extraProps"
    />
    <AutoFormRendererNested
      v-else
      :field="childField"
      :schema="props.schema"
      :extra-props="props.extraProps"
    />
  </template>
</template>
