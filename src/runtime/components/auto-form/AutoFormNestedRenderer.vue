<script setup lang="ts" generic="S extends z.ZodObject">
import type { AnyObject } from '@movk/core'
import type { z } from 'zod/v4'
import type { AutoFormField } from '../../types/auto-form'
import type { AutoFormProps } from './AutoForm.vue'
import { UCollapsible } from '#components'
import { computed, getCurrentInstance, h } from 'vue'
import { useAutoFormInjector } from '../../composables/useAutoFormContext'
import { isLeafField, VNodeRender } from '../../utils/auto-form'
import AutoFormFieldRenderer from './AutoFormFieldRenderer.vue'

interface AutoFormNestedRendererProps<S extends z.ZodObject> extends Pick<AutoFormProps<S>, 'schema'> {
  field: AutoFormField
  extraProps?: AnyObject
}

const {
  field,
  schema,
  extraProps,
} = defineProps<AutoFormNestedRendererProps<S>>()

const { resolveFieldProp, createSlotResolver, createSlotProps, createCollapsibleEnhancer } = useAutoFormInjector()

const slotResolver = computed(() => createSlotResolver(field))

const childEntries = computed(() => {
  if (isLeafField(field) || !field.children?.length) {
    return { leafChildren: [], nestedChildren: [] }
  }

  const leafChildren: AutoFormField[] = []
  const nestedChildren: AutoFormField[] = []

  // 单次遍历完成分类
  for (const childField of field.children) {
    if (isLeafField(childField)) {
      leafChildren.push(childField)
    }
    else {
      nestedChildren.push(childField)
    }
  }

  return { leafChildren, nestedChildren }
})

const { collapsibleConfig, enhancedField, isHidden, useCollapsible } = createCollapsibleEnhancer(field, resolveFieldProp)
const slotProps = computed(() => createSlotProps(field, extraProps))

// 获取当前组件实例用于递归渲染
const currentInstance = getCurrentInstance()

// 提取子组件渲染逻辑,避免重复代码
function renderChildren() {
  const children = []

  // 渲染叶子节点
  for (const childField of childEntries.value.leafChildren) {
    children.push(h(AutoFormFieldRenderer, {
      key: childField.path,
      field: childField,
      schema,
      extraProps,
    }))
  }

  // 渲染嵌套节点 - 使用当前组件实例类型进行递归
  for (const childField of childEntries.value.nestedChildren) {
    children.push(h(currentInstance!.type, {
      key: childField.path,
      field: childField,
      schema,
      extraProps,
    }))
  }

  return children
}
</script>

<template>
  <UCollapsible v-show="!isHidden" v-if="useCollapsible" v-bind="collapsibleConfig">
    <template #default="{ open }">
      <AutoFormFieldRenderer :field="enhancedField" :schema="schema" :extra-props="{ ...extraProps, open }" />
    </template>
    <template #content>
      <VNodeRender v-if="slotResolver.hasSlot('content')" :node="slotResolver.renderSlot('content', slotProps)" />
      <component :is="() => renderChildren()" v-else />
    </template>
  </UCollapsible>

  <component :is="() => renderChildren()" v-else />
</template>
