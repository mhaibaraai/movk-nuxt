<script setup lang="ts" generic="S extends z.ZodObject">
import type { AnyObject } from '@movk/core'
import type { z } from 'zod/v4'
import type { AutoFormField } from '../../types/auto-form'
import type { AutoFormProps } from './AutoForm.vue'
import { UButton, UCollapsible } from '#components'
import { useSortable } from '@vueuse/integrations/useSortable'
import { computed, ref, unref, useTemplateRef } from 'vue'
import { useAutoFormInjector } from '../../composables/useAutoFormContext'
import { joinPath } from '../../core'
import { generateDefaultValue } from '../../utils/auto-form'
import AutoFormFieldRenderer from './AutoFormFieldRenderer.vue'
import AutoFormNestedRenderer from './AutoFormNestedRenderer.vue'

interface AutoFormArrayRendererProps<S extends z.ZodObject> extends Pick<AutoFormProps<S>, 'schema' | 'enableTransition'> {
  field: AutoFormField
  extraProps?: AnyObject
}

const {
  field,
  schema,
  extraProps,
} = defineProps<AutoFormArrayRendererProps<S>>()

const { resolveFieldProp, createFieldContext, createCollapsibleEnhancer } = useAutoFormInjector()

const context = createFieldContext(field)

const elementTemplate = computed(() => field.arrayElement)

const isObjectElement = computed(() => {
  if (!elementTemplate.value)
    return false
  return elementTemplate.value.meta.type === 'object'
})

const arrayValue = computed(() => {
  const value = context.value as any[]
  return Array.isArray(value) ? value : []
})

// 缓存生成的数组项字段，避免重复生成
const arrayItemFields = computed(() => {
  const template = unref(elementTemplate)
  const arr = arrayValue.value

  if (!template || !arr.length)
    return []

  return arr.map((_, index) => ({
    ...template,
    path: joinPath([field.path, index]),
  } as AutoFormField))
})

function addItem() {
  const template = unref(elementTemplate)
  if (!template)
    return

  const newItem = generateDefaultValue(template.schema)
  const currentArray = arrayValue.value
  const newArray = [...currentArray, newItem]
  context.setValue(newArray)
}

function removeItem(index: number) {
  const currentArray = arrayValue.value
  const newArray = currentArray.filter((_, i) => i !== index)
  context.setValue(newArray)
}

const { collapsibleConfig, useCollapsible, isHidden, enhancedField } = createCollapsibleEnhancer(
  field,
  resolveFieldProp,
)

const collapsibleRef = useTemplateRef('collapsibleRef')

const contentEl = computed(() => {
  const rootEl = collapsibleRef.value?.$el
  if (!rootEl) return null
  // 查找 CollapsibleContent 元素（通过 id 模糊匹配）
  return rootEl.querySelector('[id*="reka-collapsible-content"]')
})

useSortable(contentEl, arrayItemFields, {
  animation: 150,
})
</script>

<template>
  <UCollapsible v-show="!isHidden" v-if="useCollapsible" v-bind="collapsibleConfig" ref="collapsibleRef">
    <template #default="{ open }">
      <AutoFormFieldRenderer :field="enhancedField" :schema="schema" :extra-props="{ ...extraProps, open }" />
    </template>

    <template v-if="elementTemplate" #content>
      {{ console.log('22 d', arrayItemFields) }}
      <template v-if="isObjectElement">
        <AutoFormNestedRenderer
          v-for="(_, count) in arrayValue"
          :key="count"
          :field="arrayItemFields[count]!"
          :schema="schema"
          :extra-props="extraProps"
        />
      </template>
      <template v-else>
        <div v-for="(_, count) in arrayValue" :key="count" class="flex items-center gap-2">
          <AutoFormFieldRenderer
            :field="arrayItemFields[count]!"
            :schema="schema"
            :extra-props="{ ...extraProps, index: count, remove: () => removeItem(count) }"
            class="flex-1"
          />
          <UButton
            icon="i-lucide-trash-2"
            color="error"
            variant="ghost"
            size="sm"
            square
            @click="removeItem(count)"
          />
        </div>
      </template>
      <UButton icon="i-lucide-plus" color="primary" variant="outline" block @click="addItem">
        添加项
      </UButton>
    </template>
  </UCollapsible>
</template>
