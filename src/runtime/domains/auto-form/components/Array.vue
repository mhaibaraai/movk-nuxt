<script lang="ts" setup>
import { UButton, UCollapsible } from '#components'
import { computed, ref, watch } from 'vue'
import { useAutoFormInjector } from '../provider'
import { useMovkLocale } from '../../../composables/useMovkLocale'
import { joinPath } from '@movk/core'
import { collectFieldDefaults, createHintSlotFactory, remapFieldPath } from '../fields'
import { VNodeRender } from '../reactive'
import AutoFormRendererField from './Field.vue'
import AutoFormRendererNested from './Nested.vue'
import type { ButtonProps } from '@nuxt/ui'
import type { AutoFormField } from '../../../types/auto-form'
import type { AnyObject } from '@movk/core'

interface AutoFormRendererArrayProps {
  field: AutoFormField
  extraProps?: AnyObject
}

const props = defineProps<AutoFormRendererArrayProps>()
const { t } = useMovkLocale()

const { addButtonProps: formAddButtonProps, createCollapsibleEnhancer, createFieldContext, createSlotResolver, createSlotProps, resolveFieldProp } = useAutoFormInjector()
const context = computed(() => createFieldContext(props.field))

const slotResolver = computed(() => createSlotResolver(props.field, props.extraProps))
const slotProps = computed(() => createSlotProps(props.field, props.extraProps))

const elementTemplate = computed(() => props.field.arrayElement)

const isObjectElement = computed(() => elementTemplate.value?.meta.type === 'object')

const arrayValue = computed<unknown[]>(() => {
  const value = context.value.value
  return Array.isArray(value) ? value : []
})

// 稳定的项 key：删除时同步剔除对应 id，外部替换数组时按长度收缩或补齐
let idCounter = 0
const itemIds = ref<string[]>([])

watch(() => arrayValue.value.length, (length) => {
  const current = itemIds.value
  if (length === current.length) return
  itemIds.value = length < current.length
    ? current.slice(0, length)
    : [...current, ...Array.from({ length: length - current.length }, () => `${props.field.path}-${idCounter++}`)]
}, { immediate: true })

function withHintSlots(field: AutoFormField, isItemRoot: boolean, hintSlotFactory: ReturnType<typeof createHintSlotFactory>): AutoFormField {
  const isObject = field.meta?.type === 'object'
  const needsHint = isItemRoot || isObject

  return {
    ...field,
    meta: needsHint
      ? {
          ...field.meta,
          fieldSlots: {
            hint: (slotProps: { open?: boolean, count?: number }) => hintSlotFactory(field, isItemRoot, slotProps.open, slotProps.count),
            ...field.meta?.fieldSlots
          }
        }
      : field.meta,
    ...(field.children && { children: field.children.map(child => withHintSlots(child, false, hintSlotFactory)) })
  } as AutoFormField
}

const arrayItemFields = computed(() => {
  const template = elementTemplate.value
  if (!template) return []

  const factory = createHintSlotFactory(removeItem)

  return arrayValue.value.map((_, index) => {
    const item = remapFieldPath(template, template.path, joinPath([props.field.path, index]))
    return withHintSlots(item, true, factory)
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
  context.value.setValue(newArray)
}

function removeItem(count?: number) {
  if (count === undefined)
    return

  const arr = arrayValue.value
  const newArray = [...arr.slice(0, count), ...arr.slice(count + 1)]

  itemIds.value = [...itemIds.value.slice(0, count), ...itemIds.value.slice(count + 1)]

  context.value.setValue(newArray)
}

const { collapsibleConfig, shouldShowCollapsible, isHidden, enhancedField } = createCollapsibleEnhancer(() => props.field, () => props.extraProps)

const DEFAULT_ADD_BUTTON_PROPS = {
  icon: 'i-lucide-plus',
  color: 'info',
  variant: 'soft',
  size: 'sm'
} satisfies ButtonProps

const addButtonProps = computed(() => ({
  ...DEFAULT_ADD_BUTTON_PROPS,
  size: resolveFieldProp(props.field, 'size', 'sm', props.extraProps),
  ...formAddButtonProps.value
}))
</script>

<template>
  <UCollapsible v-if="shouldShowCollapsible" v-show="!isHidden" v-bind="collapsibleConfig || {}">
    <template #default="{ open }">
      <AutoFormRendererField :field="enhancedField" :extra-props="{ ...props.extraProps, open }" />
    </template>

    <template v-if="elementTemplate" #content>
      <VNodeRender v-if="slotResolver.hasSlot('before')" :node="slotResolver.renderSlot('before', slotProps)" />
      <VNodeRender v-if="slotResolver.hasSlot('content')" :node="slotResolver.renderSlot('content', slotProps)" />
      <template v-else>
        <template v-for="(itemField, count) in arrayItemFields" :key="itemIds[count] ?? count">
          <component
            :is="isObjectElement ? AutoFormRendererNested : AutoFormRendererField"
            :field="itemField"
            :extra-props="{ ...props.extraProps, count }"
          />
        </template>
      </template>
      <UButton :label="t('autoForm.add')" v-bind="addButtonProps" @click="addItem" />
      <VNodeRender v-if="slotResolver.hasSlot('after')" :node="slotResolver.renderSlot('after', slotProps)" />
    </template>
  </UCollapsible>

  <template v-else-if="elementTemplate">
    <template v-for="(itemField, count) in arrayItemFields" :key="itemIds[count] ?? count">
      <component
        :is="isObjectElement ? AutoFormRendererNested : AutoFormRendererField"
        :field="itemField"
        :extra-props="{ ...props.extraProps, count }"
      />
    </template>
    <UButton :label="t('autoForm.add')" v-bind="addButtonProps" @click="addItem" />
  </template>
</template>
