<script setup lang="ts" generic="S extends z.ZodObject">
import type { z } from 'zod/v4'
import type { AccordionConfig, AutoFormField } from '../../types/auto-form'
import { computed } from 'vue'
import { generateAccordionItems, groupFieldsByType, isLeafField } from '../../utils/accordion/accordion-utils'
import AutoFormFieldRenderer from './AutoFormFieldRenderer.vue'

export interface AutoFormNestedRendererProps<S extends z.ZodObject> {
  /** 要渲染的字段列表 */
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

// 分析字段结构
// const fieldGroups = computed(() => groupFieldsByType(fields))

// 分离叶子字段和对象字段
const fieldGroups = computed(() => {
  if (isLeafField(field) || !field.children || field.children.length === 0) {
    return { objectFields: [], regularFields: [] }
  }
  return groupFieldsByType(field.children)
})

// 生成嵌套对象字段的 accordion items
const nestedAccordionItems = computed(() => {
  return generateAccordionItems(fieldGroups.value.objectFields, accordion)
})

// 判断是否应该为嵌套对象字段使用 UAccordion
// const shouldUseNestedAccordion = computed(() => {
//   return accordion?.enabled && nestedAccordionItems.value.length > 0
// })
</script>

<template>
  <template v-if="isLeafField(field)">
    <!-- 渲染普通字段 -->
    <AutoFormFieldRenderer :field="field" :schema="schema" :size="size" />
  </template>

  <!-- 渲染嵌套对象字段 -->
  <template v-else>
    <!-- 先渲染对象字段的 accordion -->
    <UAccordion
      v-if="fieldGroups.objectFields.length > 0"
      :items="nestedAccordionItems"
      v-bind="accordion?.props"
    >
      <!-- 只为对象字段创建对应的内容插槽 -->
      <template
        v-for="objectField in fieldGroups.objectFields"
        :key="`content-${objectField.path}`"
        #[`content-${objectField.path}`]
      >
        <!-- 递归渲染嵌套对象字段的内容 -->
        <AutoFormNestedRenderer
          :field="objectField"
          :schema="schema"
          :size="size"
          :accordion="accordion"
        />
      </template>
    </UAccordion>

    <!-- 然后渲染当前层级的叶子字段 (Name, Value 等) -->
    <template v-for="leafField in fieldGroups.regularFields" :key="leafField.path">
      <AutoFormFieldRenderer :field="leafField" :schema="schema" :size="size" />
    </template>
  </template>
</template>
