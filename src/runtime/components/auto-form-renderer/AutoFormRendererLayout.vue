<script setup lang="ts" generic="S extends z.ZodObject">
import type { AnyObject } from '@movk/core'
import type { z } from 'zod/v4'
import type { AutoFormField } from '../../types/auto-form'
import type { AutoFormProps } from '../AutoForm.vue'
import { computed, defineAsyncComponent, resolveDynamicComponent } from 'vue'
import { classifyFields } from '../../utils/auto-form'
import AutoFormRendererArray from './AutoFormRendererArray.vue'
import AutoFormRendererField from './AutoFormRendererField.vue'

const AutoFormRendererNested = defineAsyncComponent(() =>
  import('./AutoFormRendererNested.vue')
)

interface AutoFormRendererLayoutProps<S extends z.ZodObject> extends Pick<AutoFormProps<S>, 'schema'> {
  field: AutoFormField
  extraProps?: AnyObject
}

const {
  field,
  schema,
  extraProps
} = defineProps<AutoFormRendererLayoutProps<S>>()

const renderData = computed(() => {
  if (!field.children?.length) {
    return null
  }

  const classified = classifyFields(field.children)
  return {
    ...classified,
    allFields: field.children
  }
})

const layoutComponent = computed(() => {
  if (!field.meta?.layout?.component) {
    return 'div'
  }
  return resolveDynamicComponent(field.meta.layout.component)
})

const layoutProps = computed(() => {
  const config = field.meta.layout
  if (!config) return {}

  const props: Record<string, any> = {}

  if (config.props) {
    Object.assign(props, config.props)
  }

  if (config.class) {
    props.class = config.class
  }

  return props
})

const layoutSlots = computed(() => {
  const config = field.meta.layout
  if (!config?.slots) return {}

  const slots: Record<string, any> = {}

  for (const [slotName, slotFn] of Object.entries(config.slots)) {
    if (typeof slotFn === 'function') {
      slots[slotName] = slotFn
    }
  }

  return slots
})
</script>

<template>
  <component :is="layoutComponent" v-bind="layoutProps" v-if="renderData">
    <template v-for="(slotFn, slotName) in layoutSlots" :key="slotName" #[slotName]>
      <component :is="slotFn" />
    </template>

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
  </component>
</template>
