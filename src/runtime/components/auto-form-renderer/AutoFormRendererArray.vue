<script setup lang="ts" generic="S extends z.ZodObject">
import type { AnyObject } from '@movk/core'
import type { ButtonProps } from '@nuxt/ui'
import type { z } from 'zod/v4'
import type { AutoFormField } from '../../types/auto-form'
import type { AutoFormProps } from '../AutoForm.vue'
import { UButton, UCollapsible } from '#components'
import { computed, ref, unref } from 'vue'
import { useAutoFormInjector } from '../../internal/useAutoFormProvider'
import { joinPath } from '../../core'
import { collectFieldDefaults, createHintSlotFactory, VNodeRender } from '../../utils/auto-form'
import AutoFormRendererField from './AutoFormRendererField.vue'
import AutoFormRendererNested from './AutoFormRendererNested.vue'

interface AutoFormRendererArrayProps<S extends z.ZodObject> extends Pick<AutoFormProps<S>, 'schema'> {
  field: AutoFormField
  extraProps?: AnyObject
  addButtonProps?: Partial<ButtonProps>
}

const {
  extraProps,
  field,
  schema,
  addButtonProps: customAddButtonProps
} = defineProps<AutoFormRendererArrayProps<S>>()

const { createCollapsibleEnhancer, createFieldContext, createSlotResolver, createSlotProps } = useAutoFormInjector()
const context = createFieldContext(field)

const slotResolver = computed(() => createSlotResolver(field, extraProps))
const slotProps = computed(() => createSlotProps(field, extraProps))

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

// 为每个数组项维护稳定的唯一标识
const itemIds = ref<string[]>([])
let idCounter = 0

function ensureItemIds() {
  const arr = arrayValue.value
  // 确保 ID 数组长度与值数组一致
  while (itemIds.value.length < arr.length) {
    itemIds.value.push(`${field.path}-${idCounter++}`)
  }
}

function getItemId(_item: any, index: number): string {
  ensureItemIds()
  return itemIds.value[index]!
}

function updateFieldPaths(template: AutoFormField, oldBasePath: string, newBasePath: string, hintSlotFactory: ReturnType<typeof createHintSlotFactory>): AutoFormField {
  const path = template.path.replace(oldBasePath, newBasePath)

  const isNested = path.includes('.')
  const isObject = template.meta?.type === 'object'

  const updatedField = {
    ...template,
    path,
    meta: {
      ...template.meta,
      fieldSlots: (isNested && !isObject)
        ? {
            ...template.meta?.fieldSlots
          }
        : {
            hint: ({ open, path, count }) => hintSlotFactory(template, path, open, count),
            ...template.meta?.fieldSlots
          }
    }
  } as AutoFormField

  if (template.children) {
    updatedField.children = template.children.map(child =>
      updateFieldPaths(child, oldBasePath, newBasePath, hintSlotFactory)
    )
  }

  return updatedField
}

const arrayItemFields = computed(() => {
  const template = unref(elementTemplate)
  const arr = arrayValue.value

  if (!template || !arr.length)
    return []

  const factory = createHintSlotFactory(removeItem)

  return arr.map((_, index) => {
    const newBasePath = joinPath([field.path, index])
    return updateFieldPaths(template, field.path, newBasePath, factory)
  })
})

function createDefaultValue() {
  const template = unref(elementTemplate)
  return template ? collectFieldDefaults(template) : undefined
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

  const arr = arrayValue.value
  const newArray = [...arr.slice(0, count), ...arr.slice(count + 1)]

  // 同步删除原始值类型的 ID
  itemIds.value = [...itemIds.value.slice(0, count), ...itemIds.value.slice(count + 1)]

  context.setValue(newArray)
}

const { collapsibleConfig, shouldShowCollapsible, isHidden, enhancedField } = createCollapsibleEnhancer(field, extraProps)

const DEFAULT_ADD_BUTTON_PROPS = {
  icon: 'i-lucide-plus',
  color: 'neutral',
  variant: 'subtle',
  block: true,
  size: 'sm'
} satisfies ButtonProps

const addButtonProps = computed(() => ({
  ...DEFAULT_ADD_BUTTON_PROPS,
  ...customAddButtonProps
}))
</script>

<template>
  <UCollapsible v-if="shouldShowCollapsible" v-show="!isHidden" v-bind="collapsibleConfig || {}">
    <template #default="{ open }">
      <AutoFormRendererField :field="enhancedField" :schema="schema" :extra-props="{ ...extraProps, open }" />
    </template>

    <template v-if="elementTemplate" #content>
      <VNodeRender v-if="slotResolver.hasSlot('before')" :node="slotResolver.renderSlot('before', slotProps)" />
      <VNodeRender v-if="slotResolver.hasSlot('content')" :node="slotResolver.renderSlot('content', slotProps)" />
      <template v-else>
        <template v-for="(item, count) in arrayValue" :key="getItemId(item, count)">
          <component
            :is="isObjectElement ? AutoFormRendererNested : AutoFormRendererField"
            v-if="arrayItemFields[count]"
            :field="arrayItemFields[count]"
            :schema="schema"
            :extra-props="{ ...extraProps, count }"
          />
        </template>
      </template>
      <UButton v-bind="addButtonProps" @click="addItem">
        添加
      </UButton>
      <VNodeRender v-if="slotResolver.hasSlot('after')" :node="slotResolver.renderSlot('after', slotProps)" />
    </template>
  </UCollapsible>

  <template v-else-if="elementTemplate">
    <template v-for="(item, count) in arrayValue" :key="getItemId(item, count)">
      <component
        :is="isObjectElement ? AutoFormRendererNested : AutoFormRendererField"
        v-if="arrayItemFields[count]"
        :field="arrayItemFields[count]"
        :schema="schema"
        :extra-props="{ ...extraProps, count }"
      />
    </template>
    <UButton v-bind="addButtonProps" @click="addItem">
      添加
    </UButton>
  </template>
</template>
