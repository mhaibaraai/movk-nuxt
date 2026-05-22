<script lang="ts">
import type { z } from 'zod'
import type { AutoFormField } from '../../../types/auto-form'
import type { AnyObject } from '@movk/core'

interface AutoFormRendererLayoutProps {
  schema: z.ZodObject
  field: AutoFormField
  extraProps?: AnyObject
}
</script>

<script lang="ts" setup>
import { computed, resolveDynamicComponent } from 'vue'
import { resolveReactiveValue } from '../reactive'
import { useAutoFormInjector } from '../provider'
import AutoFormRendererChildren from './Children.vue'

const props = defineProps<AutoFormRendererLayoutProps>()

const { createFieldContext, resolveFieldProp } = useAutoFormInjector()

function getFieldName(f: AutoFormField) {
  return f.path.split('.').pop() || f.path
}

const visibleFields = computed(() => {
  if (!props.field.children?.length) return []
  return props.field.children.filter(f =>
    f && (f.meta?.if === undefined || resolveFieldProp<boolean>(f, 'if') === true)
  )
})

const layoutComponent = computed(() => {
  if (!props.field.meta?.layout?.component) {
    return 'div'
  }
  return resolveDynamicComponent(props.field.meta.layout.component)
})

const layoutProps = computed(() => {
  const config = props.field.meta.layout
  if (!config) return {}

  const context = createFieldContext(props.field)
  return {
    ...resolveReactiveValue(config.props, context),
    ...(config.class && { class: resolveReactiveValue(config.class, context) })
  }
})

const layoutSlots = computed(() => {
  const config = props.field.meta.layout
  if (!config?.slots) return {}

  const context = createFieldContext(props.field)
  const resolvedSlots = resolveReactiveValue(config.slots, context)

  return Object.entries(resolvedSlots).reduce((acc, [name, fn]) => {
    if (typeof fn === 'function') acc[name] = fn
    return acc
  }, {} as Record<string, any>)
})

const fieldsBySlot = computed(() => {
  const config = props.field.meta.layout
  if (!config || !visibleFields.value.length) return new Map<string, AutoFormField[]>()

  const context = createFieldContext(props.field)
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
      for (const f of visibleFields.value) {
        slotMapping.set(getFieldName(f), slot)
      }
    }
  }

  return visibleFields.value.reduce((map, f) => {
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
      <AutoFormRendererChildren :fields="fields" :schema="props.schema" :extra-props="props.extraProps" />
    </template>
  </component>
</template>
