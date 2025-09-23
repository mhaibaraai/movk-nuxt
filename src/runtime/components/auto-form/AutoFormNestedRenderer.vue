<script setup lang="ts" generic="S extends z.ZodObject">
import type { z } from 'zod/v4'
import type { AccordionConfig, AutoFormField } from '../../types/auto-form'
import { computed, h } from 'vue'
import { useAutoFormInjector } from '../../composables/useAutoFormContext'
import { generateAccordionItems, getFieldType, isLeafField } from '../../utils/accordion/accordion-utils'
import { VNodeRender } from '../../utils/rendering/vnode-utils'
import AutoFormFieldRenderer from './AutoFormFieldRenderer.vue'

export interface AutoFormNestedRendererProps<S extends z.ZodObject> {
  /** 要渲染的对象字段 */
  field: AutoFormField
  /** 表单 schema */
  schema?: S
  /** 字段尺寸 */
  size?: 'md' | 'xs' | 'sm' | 'lg' | 'xl'
  /** UAccordion 配置 */
  accordion?: AccordionConfig
}

const {
  field,
  schema,
  size,
  accordion,
} = defineProps<AutoFormNestedRendererProps<S>>()

// 获取插槽系统
const { createAccordionSlots } = useAutoFormInjector()

// 获取子字段列表
const childrenFields = computed(() =>
  !isLeafField(field) && field.children?.length ? field.children : [],
)

// 检查是否应该使用accordion包装并生成item
const accordionData = computed(() => {
  const hasChildren = childrenFields.value.length > 0
  const enabled = accordion?.enabled && hasChildren

  return {
    enabled,
    item: enabled ? generateAccordionItems(field, accordion) || null : null,
  }
})

// 为 UAccordion 创建动态插槽配置
const accordionSlots = computed(() => {
  if (!accordionData.value.enabled || !accordionData.value.item)
    return {}

  // 直接使用类型化插槽创建方法，传入默认实现
  return createAccordionSlots(field, {
    default: () => h(AutoFormFieldRenderer, { field, schema, size }),
  })
})
</script>

<template>
  <!-- 如果启用accordion，将整个对象字段包装在accordion中 -->
  <template v-if="accordionData.enabled && accordionData.item">
    <UAccordion :items="[accordionData.item]" v-bind="accordion?.props">
      <!-- 动态渲染 accordion 插槽 -->
      <template v-for="(slotFunc, slotName) in accordionSlots" :key="slotName" #[slotName]="slotData">
        <VNodeRender :node="slotFunc(slotData)" />
      </template>

      <!-- content 插槽 - 渲染子字段 -->
      <template #[`content-${field.path}`]>
        <!-- 在accordion内部按原始顺序渲染子字段 -->
        <template v-for="childField in childrenFields" :key="childField.path">
          <!-- 叶子字段：直接渲染 -->
          <AutoFormFieldRenderer
            v-if="getFieldType(childField) === 'leaf'"
            :field="childField"
            :schema="schema"
            :size="size"
          />

          <!-- 嵌套对象字段：递归渲染 -->
          <AutoFormNestedRenderer v-else :field="childField" :schema="schema" :size="size" :accordion="accordion" />
        </template>
      </template>
    </UAccordion>
  </template>

  <!-- 不使用accordion：直接按顺序渲染子字段 -->
  <template v-else>
    <template v-for="childField in childrenFields" :key="childField.path">
      <!-- 叶子字段：直接渲染 -->
      <AutoFormFieldRenderer
        v-if="getFieldType(childField) === 'leaf'"
        :field="childField"
        :schema="schema"
        :size="size"
      />

      <!-- 嵌套对象字段：递归渲染 -->
      <AutoFormNestedRenderer v-else :field="childField" :schema="schema" :size="size" :accordion="accordion" />
    </template>
  </template>
</template>
