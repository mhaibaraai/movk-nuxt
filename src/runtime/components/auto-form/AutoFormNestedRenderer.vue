<script setup lang="ts" generic="S extends z.ZodObject, N extends boolean = false">
import type { z } from 'zod/v4'
import type { AccordionConfig, AutoFormField } from '../../types/auto-form'
import { computed } from 'vue'
import { flattenFields, generateAccordionItems, groupFieldsByType } from '../../utils/auto-form'
import AutoFormFieldRenderer from './AutoFormFieldRenderer.vue'

export interface AutoFormNestedRendererProps<S extends z.ZodObject, N extends boolean = false> {
  /** 要渲染的字段列表 */
  fields: AutoFormField[]
  /** 表单 schema */
  schema?: S
  /** 字段名称（嵌套表单时使用） */
  name?: N extends true ? string : never
  /** 字段尺寸 */
  size?: 'md' | 'xs' | 'sm' | 'lg' | 'xl'
  /** 是否启用过渡动画 */
  enableTransition?: boolean
  /** UAccordion 配置 */
  accordion?: AccordionConfig
}

const {
  fields,
  schema,
  name,
  size,
  enableTransition = true,
  accordion,
} = defineProps<AutoFormNestedRendererProps<S, N>>()

// 分析字段结构
const fieldGroups = computed(() => groupFieldsByType(fields))

// 生成嵌套对象字段的 accordion items
const nestedAccordionItems = computed(() => {
  if (!accordion?.enabled || fieldGroups.value.objectFields.length === 0) {
    return []
  }
  // 只为当前级别的对象字段生成 accordion items
  return generateAccordionItems(fieldGroups.value.objectFields, accordion)
})

// 判断是否应该为嵌套对象字段使用 UAccordion
const shouldUseNestedAccordion = computed(() => {
  return accordion?.enabled && fieldGroups.value.objectFields.length > 0
})
</script>

<template>
  <!-- 渲染普通字段 -->
  <TransitionGroup
    v-if="fieldGroups.regularFields.length > 0"
    :name="enableTransition ? 'auto-form-field' : ''"
    :duration="{ enter: 350, leave: 250 }"
  >
    <template v-for="field in fieldGroups.regularFields" :key="field.path">
      <AutoFormFieldRenderer :field="field" :schema="schema" :name="name" :size="size" />
    </template>
  </TransitionGroup>

  <!-- 渲染嵌套对象字段 -->
  <template v-if="shouldUseNestedAccordion">
    <UAccordion
      :items="nestedAccordionItems"
      v-bind="accordion?.props"
    >
      <!-- 为每个嵌套对象字段创建对应的内容插槽 -->
      <template
        v-for="objectField in fieldGroups.objectFields"
        :key="`content-${objectField.path}`"
        #[`content-${objectField.path}`]
      >
        <!-- 递归渲染嵌套对象字段的内容 -->
        <AutoFormNestedRenderer
          v-if="objectField.children"
          :fields="objectField.children"
          :schema="schema"
          :name="name"
          :size="size"
          :enable-transition="enableTransition"
          :accordion="accordion"
        />
      </template>
    </UAccordion>
  </template>

  <!-- 如果不使用嵌套 accordion，展平显示所有字段 -->
  <template v-else-if="fieldGroups.objectFields.length > 0">
    <TransitionGroup
      :name="enableTransition ? 'auto-form-field' : ''"
      :duration="{ enter: 350, leave: 250 }"
    >
      <template v-for="field in flattenFields(fieldGroups.objectFields)" :key="field.path">
        <AutoFormFieldRenderer :field="field" :schema="schema" :name="name" :size="size" />
      </template>
    </TransitionGroup>
  </template>
</template>
