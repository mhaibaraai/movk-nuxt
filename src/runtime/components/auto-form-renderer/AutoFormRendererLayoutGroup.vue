<script setup lang="ts" generic="S extends z.ZodObject">
import type { AnyObject } from '@movk/core'
import type { z } from 'zod/v4'
import type { AutoFormField } from '../../types/auto-form'
import type { AutoFormProps } from '../AutoForm.vue'
import { computed } from 'vue'
import { useAutoFormInjector } from '../../composables/useAutoFormContext'
import { isLeafField, VNodeRender } from '../../utils/auto-form'
import AutoFormRendererField from './AutoFormRendererField.vue'
import AutoFormRendererNested from './AutoFormRendererNested.vue'

interface AutoFormRendererLayoutGroupProps<S extends z.ZodObject> extends Pick<AutoFormProps<S>, 'schema'> {
  field: AutoFormField
  extraProps?: AnyObject
}

const {
  field,
  schema,
  extraProps
} = defineProps<AutoFormRendererLayoutGroupProps<S>>()

const { createSlotResolver, createSlotProps } = useAutoFormInjector()

const childEntries = computed(() => {
  if (isLeafField(field) || !field.children?.length) {
    return { leafChildren: [], nestedChildren: [], layoutGroupChildren: [] }
  }

  const leafChildren: AutoFormField[] = []
  const nestedChildren: AutoFormField[] = []
  const layoutGroupChildren: AutoFormField[] = []

  // 单次遍历完成分类
  for (const childField of field.children) {
    if (childField.meta.type === 'layoutGroup') {
      layoutGroupChildren.push(childField)
    } else if (isLeafField(childField)) {
      leafChildren.push(childField)
    } else {
      nestedChildren.push(childField)
    }
  }

  return { leafChildren, nestedChildren, layoutGroupChildren }
})

const slotResolver = computed(() => createSlotResolver(field, extraProps))
const slotProps = computed(() => createSlotProps(field, extraProps))

// 获取布局配置
const layoutConfig = computed(() => ({
  as: field.meta.layoutGroup?.as || 'div',
  class: field.meta.layoutGroup?.class || ''
}))
</script>

<template>
  <component :is="layoutConfig.as" :class="layoutConfig.class">
    <VNodeRender v-if="slotResolver.hasSlot('content')" :node="slotResolver.renderSlot('content', slotProps)" />
    <template v-else>
      <template v-for="childField in childEntries.leafChildren" :key="childField.path">
        <AutoFormRendererField
          :field="childField"
          :schema="schema"
          :extra-props="extraProps"
        />
      </template>

      <template v-for="childField in childEntries.nestedChildren" :key="childField.path">
        <AutoFormRendererNested
          :field="childField"
          :schema="schema"
          :extra-props="extraProps"
        />
      </template>

      <template v-for="childField in childEntries.layoutGroupChildren" :key="childField.path">
        <AutoFormRendererLayoutGroup
          :field="childField"
          :schema="schema"
          :extra-props="extraProps"
        />
      </template>
    </template>
  </component>
</template>
