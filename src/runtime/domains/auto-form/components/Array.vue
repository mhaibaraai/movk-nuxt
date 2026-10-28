<script lang="ts" setup>
import { UButton, UCollapsible } from '#components'
import { computed, ref, watch } from 'vue'
import { useAutoFormInjector } from '../provider'
import { useMovkLocale } from '../../../composables/useMovkLocale'
import { deepClone, joinPath } from '@movk/core'
import { collectFieldDefaults, createHintSlotFactory, remapFieldPath } from '../fields'
import type { ArrayItemActions } from '../fields'
import { getArrayLengthBounds } from '../schema'
import { insertAfter, swapAt, withoutAt } from '../array-ops'
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

const bounds = computed(() => getArrayLengthBounds(props.field.schema))
const canAdd = computed(() => arrayValue.value.length < bounds.value.max)
const canRemove = computed(() => arrayValue.value.length > bounds.value.min)

function setItems(next: unknown[], ids: string[]) {
  itemIds.value = ids
  context.value.setValue(next)
}

function removeItem(index: number) {
  if (!canRemove.value) return
  setItems(withoutAt(arrayValue.value, index), withoutAt(itemIds.value, index))
}

function moveItem(index: number, offset: -1 | 1) {
  const target = index + offset
  if (target < 0 || target >= arrayValue.value.length) return
  setItems(swapAt(arrayValue.value, index, target), swapAt(itemIds.value, index, target))
}

function duplicateItem(index: number) {
  if (!canAdd.value) return
  setItems(
    insertAfter(arrayValue.value, index, deepClone(arrayValue.value[index])),
    insertAfter(itemIds.value, index, `${props.field.path}-${idCounter++}`)
  )
}

const itemActions = computed<ArrayItemActions>(() => ({
  remove: removeItem,
  move: props.field.meta.sortable ? moveItem : undefined,
  duplicate: props.field.meta.duplicable ? duplicateItem : undefined,
  canRemove: () => canRemove.value,
  canAdd: () => canAdd.value,
  length: () => arrayValue.value.length,
  labels: {
    moveUp: t('autoForm.moveUp'),
    moveDown: t('autoForm.moveDown'),
    duplicate: t('autoForm.duplicate'),
    remove: t('autoForm.remove')
  }
}))

const arrayItemFields = computed(() => {
  const template = elementTemplate.value
  if (!template) return []

  const factory = createHintSlotFactory(itemActions.value)

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
  if (!elementTemplate.value || !canAdd.value) return
  context.value.setValue([...arrayValue.value, createDefaultValue()])
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
  disabled: !canAdd.value,
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
