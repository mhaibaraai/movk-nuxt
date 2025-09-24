<script setup lang="ts" generic="S extends z.ZodObject">
import type { z } from 'zod/v4'
import type { AutoFormField } from '../../types/auto-form'
import type { AutoFormProps } from './AutoForm.vue'
import defu from 'defu'
import { computed, h } from 'vue'
import { useAutoFormInjector } from '../../composables/useAutoFormContext'
import { generateAccordionItems, getFieldType, isLeafField, VNodeRender } from '../../utils/auto-form/rendering'
import AutoFormFieldRenderer from './AutoFormFieldRenderer.vue'

interface AutoFormNestedRendererProps<S extends z.ZodObject> extends Pick<AutoFormProps<S>, 'schema' | 'accordion'> {
  field: AutoFormField
}

const {
  field,
  schema,
  accordion,
} = defineProps<AutoFormNestedRendererProps<S>>()

// 获取插槽系统
const { createAccordionSlots, resolveFieldProp, createSlotResolver } = useAutoFormInjector()

// 为当前字段创建插槽解析器
const slotResolver = createSlotResolver(field)

// 创建插槽属性
function createSlotProps(extraProps = {}) {
  return {
    field,
    state: undefined, // 将由实际使用时填充
    path: field.path,
    value: undefined, // 将由实际使用时填充
    setValue: () => {},
    ...extraProps,
  }
}

// 获取子字段列表
const childrenFields = computed(() =>
  !isLeafField(field) && field.children?.length ? field.children : [],
)

// 获取字段级accordion配置
const fieldAccordionConfig = computed(() =>
  resolveFieldProp(field, 'accordion', {}),
)

// 合并全局和字段级配置
const mergedAccordionConfig = computed(() =>
  defu(fieldAccordionConfig.value, accordion, { enabled: false }),
)

// 检查是否启用 accordion（考虑字段级开关）
const useAccordion = computed(() =>
  mergedAccordionConfig.value?.enabled && childrenFields.value.length > 0,
)

// 生成 accordion item（仅在需要时）
const accordionItem = computed(() =>
  useAccordion.value ? generateAccordionItems(field, mergedAccordionConfig.value) : null,
)

// 为 UAccordion 创建动态插槽配置
const accordionSlots = computed(() => {
  if (!useAccordion.value || !accordionItem.value)
    return {}

  return createAccordionSlots(field, {
    default: () => h(AutoFormFieldRenderer, { field, schema }),
  })
})
</script>

<template>
  <!-- 检查 hidden 属性 -->
  <template v-if="!resolveFieldProp(field, 'hidden')">
    <!-- 优先检查完全替换插槽 -->
    <template v-if="slotResolver.hasSlot(field.path)">
      <VNodeRender :node="slotResolver.renderSlot(field.path, createSlotProps())" />
    </template>

    <!-- 其次使用 UAccordion 渲染 -->
    <template v-else-if="useAccordion && accordionItem">
      <UAccordion :items="[accordionItem]" v-bind="mergedAccordionConfig">
        <!-- 动态渲染 accordion 插槽 -->
        <template v-for="(slotFunc, slotName) in accordionSlots" :key="slotName" #[slotName]="slotData">
          <VNodeRender :node="slotFunc(slotData)" />
        </template>

        <!-- content 插槽 - 渲染子字段 -->
        <template #[`content-${field.path}`]>
          <template v-for="childField in childrenFields" :key="childField.path">
            <AutoFormFieldRenderer
              v-if="getFieldType(childField) === 'leaf'"
              :field="childField"
              :schema="schema"
            />
            <AutoFormNestedRenderer v-else :field="childField" :schema="schema" :accordion="accordion" />
          </template>
        </template>
      </UAccordion>
    </template>

    <!-- 最后降级到直接渲染子字段 -->
    <template v-else>
      <template v-for="childField in childrenFields" :key="childField.path">
        <AutoFormFieldRenderer
          v-if="getFieldType(childField) === 'leaf'"
          :field="childField"
          :schema="schema"
        />
        <AutoFormNestedRenderer v-else :field="childField" :schema="schema" :accordion="accordion" />
      </template>
    </template>
  </template>
</template>
