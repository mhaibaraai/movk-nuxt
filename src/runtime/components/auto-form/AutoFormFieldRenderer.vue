<script setup lang="ts" generic="S extends z.ZodObject">
import type { z } from 'zod/v4'
import type { AutoFormField } from '../../types/auto-form'
import type { AutoFormProps } from './AutoForm.vue'
import { useAutoFormInjector } from '../../composables/useAutoFormContext'
import { VNodeRender } from '../../utils/auto-form/rendering'

interface AutoFormFieldProps<S extends z.ZodObject> extends Pick<AutoFormProps<S>, 'schema'> {
  field: AutoFormField
}

const { field } = defineProps<AutoFormFieldProps<S>>()

// 获取所有方法和上下文工厂
const {
  resolveFieldProp,
  renderControl,
  createSlotResolver,
  createFormFieldSlots,
  createSlotProps,
} = useAutoFormInjector()

// 为当前字段创建插槽解析器
const slotResolver = createSlotResolver(field)
</script>

<template>
  <UFormField
    v-show="!resolveFieldProp(field, 'hidden')"
    :name="resolveFieldProp(field, 'name', field.path)"
    :as="resolveFieldProp(field, 'as')"
    :error-pattern="resolveFieldProp(field, 'errorPattern')"
    :label="resolveFieldProp(field, 'label')"
    :description="resolveFieldProp(field, 'description')"
    :help="resolveFieldProp(field, 'help')"
    :hint="resolveFieldProp(field, 'hint')"
    :size="resolveFieldProp(field, 'size')"
    :required="resolveFieldProp(field, 'required')"
    :eager-validation="resolveFieldProp(field, 'eagerValidation')"
    :validate-on-input-delay="resolveFieldProp(field, 'validateOnInputDelay')"
    :class="resolveFieldProp(field, 'class')"
    :ui="resolveFieldProp(field, 'ui')"
  >
    <!-- 使用统一的插槽渲染器，大幅简化代码 -->
    <template
      v-for="(slotComponent, slotName) in createFormFieldSlots(field, slotResolver)"
      :key="slotName"
      #[slotName]="slotData"
    >
      <VNodeRender :node="slotComponent(slotData)" />
    </template>

    <!-- 默认插槽处理 -->
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
