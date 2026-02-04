<script setup lang="ts" generic="S extends z.ZodObject">
import type { z } from 'zod'
import type { AutoFormField } from '../../types/auto-form'
import type { AutoFormProps } from '../AutoForm.vue'
import type { AnyObject } from '@movk/core'
import { computed, resolveDynamicComponent } from 'vue'
import { classifyFields } from '../../utils/auto-form'
import { resolveReactiveValue } from '../../utils/reactive-utils'
import { useAutoFormInjector } from '../../internal/useAutoFormProvider'
import AutoFormRendererArray from './AutoFormRendererArray.vue'
import AutoFormRendererField from './AutoFormRendererField.vue'
import AutoFormRendererNested from './AutoFormRendererNested.vue'

export interface AutoFormRendererLayoutProps<S extends z.ZodObject> extends Pick<AutoFormProps<S>, 'schema'> {
  field: AutoFormField
  extraProps?: AnyObject
}

const {
  field,
  schema,
  extraProps
} = defineProps<AutoFormRendererLayoutProps<S>>()

const { createFieldContext, resolveFieldProp } = useAutoFormInjector()

const context = createFieldContext(field)

function getFieldName(field: AutoFormField) {
  return field.path.split('.').pop() || field.path
}

const renderData = computed(() => {
  if (!field.children?.length) return null

  const visibleFields = field.children.filter(f =>
    f && (f.meta?.if === undefined || resolveFieldProp<boolean>(f, 'if') === true)
  )

  const classified = classifyFields(visibleFields)
  return {
    ...classified,
    allFields: visibleFields
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

  return {
    ...resolveReactiveValue(config.props, context),
    ...(config.class && { class: resolveReactiveValue(config.class, context) })
  }
})

const layoutSlots = computed(() => {
  const config = field.meta.layout
  if (!config?.slots) return {}

  const resolvedSlots = resolveReactiveValue(config.slots, context)

  return Object.entries(resolvedSlots).reduce((acc, [name, fn]) => {
    if (typeof fn === 'function') acc[name] = fn
    return acc
  }, {} as Record<string, any>)
})

const fieldSlotMapping = computed(() => {
  const config = field.meta.layout
  if (!config || !renderData.value) return new Map<string, string>()

  const mapping = new Map<string, string>()

  if (config.fieldSlots) {
    const resolved = resolveReactiveValue(config.fieldSlots, context)
    Object.entries(resolved).forEach(([name, slot]) => {
      if (slot && typeof slot === 'string') mapping.set(name, slot)
    })
    return mapping
  }

  if (config.fieldSlot) {
    const slot = resolveReactiveValue(config.fieldSlot, context)
    if (slot && typeof slot === 'string') {
      renderData.value.allFields.forEach((f) => {
        mapping.set(getFieldName(f), slot)
      })
    }
  }

  return mapping
})

const fieldsBySlot = computed(() => {
  if (!renderData.value) return new Map<string, AutoFormField[]>()

  const grouped = renderData.value.allFields.reduce((map, field) => {
    const slot = fieldSlotMapping.value.get(getFieldName(field)) || 'default'
    if (!map.has(slot)) map.set(slot, [])
    map.get(slot)!.push(field)
    return map
  }, new Map<string, AutoFormField[]>())

  return grouped
})
</script>

<template>
  <component :is="layoutComponent" v-bind="layoutProps" v-if="renderData">
    <template v-for="(slotFn, slotName) in layoutSlots" :key="`slot-${slotName}`" #[slotName]>
      <component :is="slotFn" />
    </template>

    <template v-for="[slotName, fields] in fieldsBySlot.entries()" :key="`fields-${slotName}`" #[slotName]>
      <template v-for="childField in fields" :key="childField.path">
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
  </component>
</template>
