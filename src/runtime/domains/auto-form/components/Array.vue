<script lang="ts" setup generic="S extends z.ZodObject">
import { UButton, UCollapsible } from '#components'
import { computed, ref } from 'vue'
import { useAutoFormInjector } from '../provider'
import { joinPath } from '@movk/core'
import { collectFieldDefaults, createHintSlotFactory } from '../fields'
import { VNodeRender } from '../reactive'
import AutoFormRendererField from './Field.vue'
import AutoFormRendererNested from './Nested.vue'
import type { z } from 'zod'
import type { ButtonProps } from '@nuxt/ui'
import type { AutoFormField } from '../../../types/auto-form'
import type { AnyObject } from '@movk/core'
import type { AutoFormProps } from '../../../types/auto-form/component'

interface AutoFormRendererArrayProps<S extends z.ZodObject> extends Pick<AutoFormProps<S>, 'schema'> {
  field: AutoFormField
  extraProps?: AnyObject
  addButtonProps?: Partial<ButtonProps>
}

const props = defineProps<AutoFormRendererArrayProps<S>>()

const { createCollapsibleEnhancer, createFieldContext, createSlotResolver, createSlotProps, resolveFieldProp } = useAutoFormInjector()
const context = createFieldContext(props.field)

const slotResolver = computed(() => createSlotResolver(props.field, props.extraProps))
const slotProps = computed(() => createSlotProps(props.field, props.extraProps))

const elementTemplate = computed(() => props.field.arrayElement)

const isObjectElement = computed(() => elementTemplate.value?.meta.type === 'object')

const arrayValue = computed<unknown[]>(() => {
  const value = context.value
  return Array.isArray(value) ? value : []
})

const itemIds = ref<string[]>([])
const idCounter = ref(0)

function ensureItemIds() {
  const arr = arrayValue.value
  while (itemIds.value.length < arr.length) {
    itemIds.value.push(`${props.field.path}-${idCounter.value++}`)
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
            hint: (props: { open?: boolean, path: string, count?: number }) => hintSlotFactory(template, props.path, props.open, props.count),
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
  const template = elementTemplate.value
  const arr = arrayValue.value

  if (!template || !arr.length)
    return []

  const factory = createHintSlotFactory(removeItem)

  return arr.map((_, index) => {
    const newBasePath = joinPath([props.field.path, index])
    return updateFieldPaths(template, props.field.path, newBasePath, factory)
  })
})

function createDefaultValue() {
  const template = elementTemplate.value
  return template ? collectFieldDefaults(template) : undefined
}

function addItem() {
  if (!elementTemplate.value)
    return

  const newArray = [...arrayValue.value, createDefaultValue()]
  context.setValue(newArray)
}

function removeItem(count?: number) {
  if (count === undefined)
    return

  const arr = arrayValue.value
  const newArray = [...arr.slice(0, count), ...arr.slice(count + 1)]

  itemIds.value = [...itemIds.value.slice(0, count), ...itemIds.value.slice(count + 1)]

  context.setValue(newArray)
}

const { collapsibleConfig, shouldShowCollapsible, isHidden, enhancedField } = createCollapsibleEnhancer(props.field, props.extraProps)

const DEFAULT_ADD_BUTTON_PROPS = {
  icon: 'i-lucide-plus',
  color: 'info',
  variant: 'soft',
  size: 'sm'
} satisfies ButtonProps

const addButtonProps = computed(() => ({
  ...DEFAULT_ADD_BUTTON_PROPS,
  size: resolveFieldProp(props.field, 'size', 'sm', props.extraProps),
  ...props.addButtonProps
}))
</script>

<template>
  <UCollapsible v-if="shouldShowCollapsible" v-show="!isHidden" v-bind="collapsibleConfig || {}">
    <template #default="{ open }">
      <AutoFormRendererField :field="enhancedField" :schema="props.schema" :extra-props="{ ...props.extraProps, open }" />
    </template>

    <template v-if="elementTemplate" #content>
      <VNodeRender v-if="slotResolver.hasSlot('before')" :node="slotResolver.renderSlot('before', slotProps)" />
      <VNodeRender v-if="slotResolver.hasSlot('content')" :node="slotResolver.renderSlot('content', slotProps)" />
      <template v-else>
        <template v-for="(itemField, count) in arrayItemFields" :key="getItemId(arrayValue[count], count)">
          <component
            :is="isObjectElement ? AutoFormRendererNested : AutoFormRendererField"
            :field="itemField"
            :schema="props.schema"
            :extra-props="{ ...props.extraProps, count }"
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
    <template v-for="(itemField, count) in arrayItemFields" :key="getItemId(arrayValue[count], count)">
      <component
        :is="isObjectElement ? AutoFormRendererNested : AutoFormRendererField"
        :field="itemField"
        :schema="props.schema"
        :extra-props="{ ...props.extraProps, count }"
      />
    </template>
    <UButton v-bind="addButtonProps" @click="addItem">
      添加
    </UButton>
  </template>
</template>
