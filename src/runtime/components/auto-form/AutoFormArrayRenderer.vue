<script setup lang="ts" generic="S extends z.ZodObject">
import type { AnyObject } from '@movk/core'
import type { ButtonProps } from '@nuxt/ui'
import type { z } from 'zod/v4'
import type { AutoFormField } from '../../types/auto-form'
import type { AutoFormProps } from './AutoForm.vue'
import { UButton, UCollapsible } from '#components'
import { computed, shallowRef, unref } from 'vue'
import { useAutoFormInjector } from '../../composables/useAutoFormContext'
import { joinPath } from '../../core'
import { createHintSlotFactory } from '../../utils/auto-form'
import AutoFormFieldRenderer from './AutoFormFieldRenderer.vue'
import AutoFormNestedRenderer from './AutoFormNestedRenderer.vue'

interface AutoFormArrayRendererProps<S extends z.ZodObject> extends Pick<AutoFormProps<S>, 'schema'> {
  field: AutoFormField
  extraProps?: AnyObject
}

const {
  extraProps,
  field,
  schema,
} = defineProps<AutoFormArrayRendererProps<S>>()

const { createCollapsibleEnhancer, createFieldContext } = useAutoFormInjector()
const context = createFieldContext(field)

const elementTemplate = computed(() => field.arrayElement)

const isObjectElement = computed(() => {
  if (!elementTemplate.value)
    return false
  return elementTemplate.value.meta.type === 'object'
})

const arrayValue = computed<unknown[]>(() => {
  const value = context.value
  return Array.isArray(value) ? value : []
})

function updateFieldPaths(template: AutoFormField, oldBasePath: string, newBasePath: string, hintSlotFactory: ReturnType<typeof createHintSlotFactory>): AutoFormField {
  const updatedField: AutoFormField = {
    ...template,
    path: template.path.replace(oldBasePath, newBasePath),
    meta: {
      ...template.meta,
      fieldSlots: {
        ...template.meta?.fieldSlots,
        hint: ({ open, path, count }) => hintSlotFactory(template, path, open, count),
      },
    },
  }

  if (template.children) {
    updatedField.children = template.children.map(child =>
      updateFieldPaths(child, oldBasePath, newBasePath, hintSlotFactory),
    )
  }

  return updatedField
}

const hintSlotFactory = shallowRef(createHintSlotFactory(removeItem))

const arrayItemFields = computed(() => {
  const template = unref(elementTemplate)
  const arr = arrayValue.value

  if (!template || !arr.length)
    return []

  return arr.map((_, index) => {
    const newBasePath = joinPath([field.path, index])
    return updateFieldPaths(template, field.path, newBasePath, hintSlotFactory.value)
  })
})

function createDefaultValue() {
  const template = unref(elementTemplate)
  if (!template)
    return undefined

  if (template.meta?.type === 'object') {
    return {}
  }

  return undefined
}

function addItem() {
  const template = unref(elementTemplate)
  if (!template)
    return

  const newArray = [...arrayValue.value, createDefaultValue()]
  context.setValue(newArray)
}

function removeItem(count?: number) {
  if (count === undefined)
    return

  const newArray = arrayValue.value.filter((_, index) => index !== count)
  context.setValue(newArray)
}

const { collapsibleConfig, shouldShowCollapsible, isHidden, enhancedField } = createCollapsibleEnhancer(field)

const addButtonProps = {
  icon: 'i-lucide-plus',
  color: 'neutral',
  variant: 'subtle',
  block: true,
  size: 'sm',
} as ButtonProps
</script>

<template>
  <UCollapsible
    v-show="!isHidden"
    v-if="shouldShowCollapsible"
    v-bind="collapsibleConfig"
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
        v-bind="addButtonProps"
        @click="addItem"
      >
        添加
      </UButton>
    </template>
  </UCollapsible>
  <template v-else-if="!shouldShowCollapsible && elementTemplate">
    <component
      :is="isObjectElement ? AutoFormNestedRenderer : AutoFormFieldRenderer"
      v-for="(_, count) in arrayValue"
      :key="count"
      :field="arrayItemFields[count]!"
      :schema="schema"
      :extra-props="{ ...extraProps, count }"
    />
    <UButton
      v-bind="addButtonProps"
      @click="addItem"
    >
      添加
    </UButton>
  </template>
</template>
