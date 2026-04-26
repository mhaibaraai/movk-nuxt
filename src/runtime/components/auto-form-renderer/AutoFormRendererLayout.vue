<script lang="ts">
import type { z } from 'zod'
import type { AutoFormField } from '../../types/auto-form'
import type { AutoFormProps } from '../AutoForm.vue'
import type { AnyObject } from '@movk/core'

interface AutoFormRendererLayoutProps<S extends z.ZodObject> extends Pick<AutoFormProps<S>, 'schema'> {
  field: AutoFormField
  extraProps?: AnyObject
}
</script>

<script lang="ts" setup generic="S extends z.ZodObject">
import { computed, resolveDynamicComponent } from 'vue'
import { resolveReactiveValue } from '../../domains/auto-form/reactive'
import { useAutoFormInjector } from '../../domains/auto-form/provider'
import AutoFormRendererChildren from './AutoFormRendererChildren.vue'

const {
  field,
  schema,
  extraProps
} = defineProps<AutoFormRendererLayoutProps<S>>()

const { createFieldContext, resolveFieldProp } = useAutoFormInjector()

function getFieldName(f: AutoFormField) {
  return f.path.split('.').pop() || f.path
}

const visibleFields = computed(() => {
  if (!field.children?.length) return []
  return field.children.filter(f =>
    f && (f.meta?.if === undefined || resolveFieldProp<boolean>(f, 'if') === true)
  )
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

  const context = createFieldContext(field)
  return {
    ...resolveReactiveValue(config.props, context),
    ...(config.class && { class: resolveReactiveValue(config.class, context) })
  }
})

const layoutSlots = computed(() => {
  const config = field.meta.layout
  if (!config?.slots) return {}

  const context = createFieldContext(field)
  const resolvedSlots = resolveReactiveValue(config.slots, context)

  return Object.entries(resolvedSlots).reduce((acc, [name, fn]) => {
    if (typeof fn === 'function') acc[name] = fn
    return acc
  }, {} as Record<string, any>)
})

const fieldsBySlot = computed(() => {
  const config = field.meta.layout
  const fields = visibleFields.value
  if (!config || !fields.length) return new Map<string, AutoFormField[]>()

  const context = createFieldContext(field)
  let slotMapping: Map<string, string> | undefined

  if (config.fieldSlots) {
    const resolved = resolveReactiveValue(config.fieldSlots, context)
    slotMapping = new Map<string, string>()
    for (const [name, slot] of Object.entries(resolved)) {
      if (slot && typeof slot === 'string') slotMapping.set(name, slot)
    }
  } else if (config.fieldSlot) {
    const slot = resolveReactiveValue(config.fieldSlot, context)
    if (slot && typeof slot === 'string') {
      slotMapping = new Map<string, string>()
      for (const f of fields) {
        slotMapping.set(getFieldName(f), slot)
      }
    }
  }

  return fields.reduce((map, f) => {
    const slot = slotMapping?.get(getFieldName(f)) || 'default'
    if (!map.has(slot)) map.set(slot, [])
    map.get(slot)!.push(f)
    return map
  }, new Map<string, AutoFormField[]>())
})
</script>

<template>
  <component :is="layoutComponent" v-bind="layoutProps" v-if="visibleFields.length">
    <template v-for="(slotFn, slotName) in layoutSlots" :key="`slot-${slotName}`" #[slotName]>
      <component :is="slotFn" />
    </template>

    <template v-for="[slotName, fields] in fieldsBySlot.entries()" :key="`fields-${slotName}`" #[slotName]>
      <AutoFormRendererChildren :fields="fields" :schema="schema" :extra-props="extraProps" />
    </template>
  </component>
</template>
