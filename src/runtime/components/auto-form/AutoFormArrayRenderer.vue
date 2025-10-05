<script setup lang="ts" generic="S extends z.ZodObject">
import type { AnyObject } from '@movk/core'
import type { z } from 'zod/v4'
import type { AutoFormField } from '../../types/auto-form'
import type { AutoFormProps } from './AutoForm.vue'
import { UButton, UCollapsible, UIcon } from '#components'
import { useSortable } from '@vueuse/integrations/useSortable'
import { computed, h, unref, useTemplateRef } from 'vue'
import { useAutoFormInjector } from '../../composables/useAutoFormContext'
import { joinPath } from '../../core'
import AutoFormFieldRenderer from './AutoFormFieldRenderer.vue'
import AutoFormNestedRenderer from './AutoFormNestedRenderer.vue'

interface AutoFormArrayRendererProps<S extends z.ZodObject> extends Pick<AutoFormProps<S>, 'schema'> {
  field: AutoFormField
  extraProps?: AnyObject
}

const props = defineProps<AutoFormArrayRendererProps<S>>()

const { resolveFieldProp, createFieldContext, createCollapsibleEnhancer } = useAutoFormInjector()
const context = createFieldContext(props.field)

const elementTemplate = computed(() => props.field.arrayElement)

const isObjectElement = computed(() => {
  if (!elementTemplate.value)
    return false
  return elementTemplate.value.meta.type === 'object'
})

const arrayValue = computed(() => {
  const value = context.value as any[]
  return Array.isArray(value) ? value : []
})

function createHintSlot(field: AutoFormField, path: string, open?: boolean, count?: number) {
  const isNested = path.includes('.')
  const isObject = field.meta?.type === 'object'

  // 创建 Chevron 图标
  const createChevron = () => h(UIcon, {
    name: open ? 'i-lucide-chevron-down' : 'i-lucide-chevron-right',
    class: 'shrink-0 size-5 transition-transform duration-200',
  })

  // 创建删除按钮
  const createDeleteButton = () => h(UButton, {
    icon: 'i-lucide-trash-2',
    color: 'error',
    variant: 'ghost',
    size: 'sm',
    square: true,
    onClick: () => removeItem(count),
  })

  // 嵌套路径且为对象类型:仅显示 Chevron
  if (isNested && isObject) {
    return h('div', { class: 'flex items-center gap-2' }, [createChevron()])
  }

  // 嵌套路径但非对象类型:不显示任何内容
  if (isNested) {
    return undefined
  }

  // 非嵌套路径且非对象类型:仅显示删除按钮
  if (!isObject) {
    return createDeleteButton()
  }

  // 非嵌套路径且为对象类型:显示删除按钮和 Chevron
  return h('div', { class: 'flex items-center gap-2' }, [
    createDeleteButton(),
    createChevron(),
  ])
}

function updateFieldPaths(field: AutoFormField, oldBasePath: string, newBasePath: string): AutoFormField {
  const updatedField = {
    ...field,
    path: field.path.replace(oldBasePath, newBasePath),
    meta: {
      fieldSlots: {
        hint: ({ open, path, count }) => createHintSlot(field, path, open, count),
        ...field.meta?.fieldSlots,
      },
      ...field.meta,
    },
  } as AutoFormField

  if (field.children) {
    updatedField.children = field.children.map(child =>
      updateFieldPaths(child, oldBasePath, newBasePath),
    )
  }

  return updatedField
}

const arrayItemFields = computed(() => {
  const template = unref(elementTemplate)
  const arr = arrayValue.value

  if (!template || !arr.length)
    return []

  return arr.map((_, index) => {
    const newBasePath = joinPath([props.field.path, index])
    return updateFieldPaths(template, props.field.path, newBasePath)
  })
})

function addItem() {
  const template = unref(elementTemplate)
  if (!template)
    return

  const newArray = [...arrayValue.value, undefined]
  context.setValue(newArray)
}

function removeItem(count?: number) {
  const newArray = arrayValue.value.filter((_, index) => index !== count)
  context.setValue(newArray)
}

const { collapsibleConfig, useCollapsible, isHidden, enhancedField } = createCollapsibleEnhancer(
  props.field,
  resolveFieldProp,
)

const collapsibleRef = useTemplateRef('collapsibleRef')

const contentEl = computed(() => {
  const rootEl = collapsibleRef.value?.$el
  if (!rootEl)
    return null
  return rootEl.querySelector('[id*="reka-collapsible-content"]')
})

useSortable(contentEl, arrayItemFields, {
  animation: 150,
})
</script>

<template>
  <UCollapsible
    v-show="!isHidden"
    v-if="useCollapsible"
    v-bind="collapsibleConfig"
    ref="collapsibleRef"
  >
    <template #default="{ open }">
      <AutoFormFieldRenderer :field="enhancedField" :schema="schema" :extra-props="{ ...extraProps, open }" />
    </template>

    <template v-if="elementTemplate" #content>
      <component
        :is="isObjectElement ? AutoFormNestedRenderer : AutoFormFieldRenderer"
        v-for="(_, count) in arrayValue"
        :key="count"
        :field="arrayItemFields[count]!"
        :schema="schema"
        :extra-props="{ ...extraProps, count }"
      />
      <UButton
        icon="i-lucide-plus"
        color="neutral"
        variant="subtle"
        block
        size="sm"
        @click="addItem"
      >
        添加
      </UButton>
    </template>
  </UCollapsible>
  <template v-else-if="!useCollapsible">
    <component
      :is="isObjectElement ? AutoFormNestedRenderer : AutoFormFieldRenderer"
      v-for="(_, count) in arrayValue"
      :key="count"
      :field="arrayItemFields[count]!"
      :schema="schema"
      :extra-props="{ ...extraProps, count }"
    />
    <UButton
      icon="i-lucide-plus"
      color="neutral"
      variant="subtle"
      block
      size="sm"
      @click="addItem"
    >
      添加
    </UButton>
  </template>
</template>
