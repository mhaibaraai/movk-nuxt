<script setup lang="ts" generic="S extends z.ZodObject, N extends boolean = false">
import type { z } from 'zod/v4'
import type { AutoFormField } from '../../types/auto-form'
import { unref } from 'vue'
import { useAutoFormInjector } from '../../composables/useAutoFormContext'
import { useFieldRenderer } from '../../composables/useFieldRenderer'
import { VNodeRender } from '../../utils/auto-form'

export interface AutoFormFieldProps<S extends z.ZodObject, N extends boolean = false> {
  field: AutoFormField
  schema?: S
  name?: N extends true ? string : never
  size?: 'md' | 'xs' | 'sm' | 'lg' | 'xl'
}

const { field } = defineProps<AutoFormFieldProps<S, N>>()

// 使用字段渲染器 composable（通过注入获取状态）
const {
  resolveFieldProp,
  renderFieldSlot,
  getResolvedFieldSlots,
  renderControl,
  createFieldContext,
} = useFieldRenderer()

// 从父组件注入插槽
const { slots: parentSlots } = useAutoFormInjector()

// 优化：预计算字段插槽解析器
function createSlotResolver(field: AutoFormField) {
  const keyPrefix = field.path
  const fieldSlots = getResolvedFieldSlots(field)

  return {
    hasSlot(name: string): boolean {
      const keySpecific = `${name}:${keyPrefix}`
      return Boolean(
        parentSlots?.[keySpecific]
        || parentSlots?.[name]
        || fieldSlots?.[name],
      )
    },

    renderSlot(name: string, slotProps: any) {
      const keySpecific = `${name}:${keyPrefix}`

      // 优先级：路径特定 > 通用 > 字段级
      if (parentSlots?.[keySpecific]) {
        return parentSlots[keySpecific](slotProps)
      }

      if (parentSlots?.[name]) {
        return parentSlots[name](slotProps)
      }

      if (fieldSlots?.[name]) {
        return renderFieldSlot(fieldSlots[name], slotProps)
      }

      return null
    },
  }
}

// 为当前字段创建插槽解析器
const slotResolver = createSlotResolver(field)

// 优化：创建插槽 props 时解引用 computed 值
function createSlotProps(field: AutoFormField, extraProps: Record<string, any> = {}) {
  const context = createFieldContext(field)
  return {
    ...extraProps,
    state: context.state,
    path: context.path,
    value: unref(context.value),
    setValue: context.setValue,
  }
}
</script>

<template>
  <UFormField
    v-show="!resolveFieldProp(field, 'hidden', field.meta?.mapped?.hidden)"
    :name="field.path"
    :as="resolveFieldProp(field, 'as')"
    :error-pattern="resolveFieldProp(field, 'errorPattern')"
    :label="resolveFieldProp(field, 'label')"
    :description="resolveFieldProp(field, 'description')"
    :help="resolveFieldProp(field, 'help')"
    :hint="resolveFieldProp(field, 'hint')"
    :size="resolveFieldProp(field, 'size', size)"
    :required="resolveFieldProp(field, 'required')"
    :eager-validation="resolveFieldProp(field, 'eagerValidation')"
    :validate-on-input-delay="resolveFieldProp(field, 'validateOnInputDelay')"
    :class="resolveFieldProp(field, 'class')"
    :ui="resolveFieldProp(field, 'ui')"
  >
    <template v-if="slotResolver.hasSlot('label')" #label="{ label }">
      <VNodeRender
        :node="slotResolver.renderSlot('label', createSlotProps(field, { label: label || resolveFieldProp(field, 'label') }))"
      />
    </template>
    <template v-if="slotResolver.hasSlot('hint')" #hint="{ hint }">
      <VNodeRender
        :node="slotResolver.renderSlot('hint', createSlotProps(field, { hint: hint || resolveFieldProp(field, 'hint') }))"
      />
    </template>
    <template v-if="slotResolver.hasSlot('description')" #description="{ description }">
      <VNodeRender
        :node="slotResolver.renderSlot('description', createSlotProps(field, { description: description || resolveFieldProp(field, 'description') }))"
      />
    </template>
    <template v-if="slotResolver.hasSlot('help')" #help="{ help }">
      <VNodeRender
        :node="slotResolver.renderSlot('help', createSlotProps(field, { help: help || resolveFieldProp(field, 'help') }))"
      />
    </template>
    <template v-if="slotResolver.hasSlot('error')" #error="{ error }">
      <VNodeRender
        :node="slotResolver.renderSlot('error', createSlotProps(field, { error }))"
      />
    </template>
    <template #default="{ error }">
      <template v-if="slotResolver.hasSlot('default')">
        <VNodeRender
          :node="slotResolver.renderSlot('default', createSlotProps(field, { error }))"
        />
      </template>
      <template v-else>
        <VNodeRender :node="renderControl(field)" />
      </template>
    </template>
  </UFormField>
</template>
