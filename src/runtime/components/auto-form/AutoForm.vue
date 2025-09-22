<script setup lang="ts" generic="S extends z.ZodObject, T extends boolean = true, N extends boolean = false">
import type { FormData, FormError, FormErrorEvent, FormInputEvents, FormSubmitEvent, InferInput } from '@nuxt/ui'
import type { z } from 'zod/v4'
import type { AccordionConfig, AutoFormControls, AutoFormField, DynamicFormSlots } from '../../types/auto-form'
import { computed, unref } from 'vue'
import { useAutoFormProvider } from '../../composables/useAutoFormContext'
import { useFieldRenderer } from '../../composables/useFieldRenderer'
import { DEFAULT_CONTROLS } from '../../constants/auto-form'
import { deepClone, getPath, setPath } from '../../core'
import { collectTopLevelObjectFields, flattenFields, generateAccordionItems, groupFieldsByType, introspectSchema, shouldEnableAccordion, VNodeRender } from '../../utils/auto-form'
import AutoFormFieldRenderer from './AutoFormFieldRenderer.vue'
import AutoFormNestedRenderer from './AutoFormNestedRenderer.vue'

export interface AutoFormProps<S extends z.ZodObject, T extends boolean = true, N extends boolean = false> {
  id?: string | number
  /** Schema to validate the form state. Supports Standard Schema objects, Yup, Joi, and Superstructs. */
  schema?: S
  /**
   * Custom validation function to validate the form state.
   * @param state - The current state of the form.
   * @returns A promise that resolves to an array of FormError objects, or an array of FormError objects directly.
   */
  validate?: (state: Partial<InferInput<S>>) => Promise<FormError[]> | FormError[]

  /**
   * The list of input events that trigger the form validation.
   * @remarks The form always validates on submit.
   * @defaultValue `['blur', 'change', 'input']`
   */
  validateOn?: FormInputEvents[]

  /** Disable all inputs inside the form. */
  disabled?: boolean

  /**
   * Path of the form's state within it's parent form.
   * Used for nesting forms. Only available if `nested` is true.
   */
  name?: N extends true ? string : never

  /**
   * Delay in milliseconds before validating the form on input events.
   * @defaultValue `300`
   */
  validateOnInputDelay?: number
  /**
   * If true, applies schema transformations on submit.
   * @defaultValue `true`
   */
  transform?: T

  /**
   * If true, this form will attach to its parent Form and validate at the same time.
   * @defaultValue `false`
   */
  nested?: N

  /**
   * When `true`, all form elements will be disabled on `@submit` event.
   * This will cause any focused input elements to lose their focus state.
   * @defaultValue `true`
   */
  loadingAuto?: boolean
  class?: any
  onSubmit?: ((event: FormSubmitEvent<FormData<S, T>>) => void | Promise<void>) | (() => void | Promise<void>)

  controls?: AutoFormControls
  size?: 'md' | 'xs' | 'sm' | 'lg' | 'xl'
  /**
   * Enable transition animation for field changes.
   * @defaultValue `true`
   */
  enableTransition?: boolean

  /**
   * UAccordion 包装配置
   * 用于控制对象字段的折叠展示
   */
  accordion?: AccordionConfig
}

export interface AutoFormEmits<S extends z.ZodObject, T extends boolean = true> {
  submit: [event: FormSubmitEvent<FormData<S, T>>]
  error: [event: FormErrorEvent]
}

export type AutoFormSlots<T extends object> = {
  'before-fields': (props: { fields: AutoFormField[], state: T }) => any
  'after-fields': (props: { fields: AutoFormField[], state: T }) => any
} & DynamicFormSlots<T>

type AutoFormStateType = N extends false ? Partial<InferInput<S>> : never
const {
  schema,
  controls,
  size,
  enableTransition = true,
  accordion,
  ...restProps
} = defineProps<AutoFormProps<S, T, N>>()
const emit = defineEmits<AutoFormEmits<S, T>>()
const _slots = defineSlots<AutoFormSlots<AutoFormStateType>>()

const state = defineModel<AutoFormStateType>({ default: () => ({}) })

// 初始化字段上下文管理
useAutoFormProvider(state, _slots)

// 分离控件映射计算，避免重复创建对象
const controlsMapping = computed(() => ({
  ...DEFAULT_CONTROLS,
  ...controls,
}))

// 优化字段计算 - 仅在 schema 或映射真正变化时重新计算
const fields = computed(() => {
  if (!schema)
    return []

  const resolvedSchema = unref(schema)
  const entries = introspectSchema(resolvedSchema, controlsMapping.value)
  console.log('entries', entries)

  // 同步初始化默认值，确保 SSR 兼容性
  for (const { decorators, path } of entries) {
    if (decorators?.defaultValue !== undefined
      && getPath(state.value, path) === undefined) {
      setPath(state.value, path, deepClone(decorators.defaultValue))
    }
  }

  return entries
})

// 优化可见性计算 - 减少不必要的函数调用
const visibleFields = computed(() => fields.value.filter((field: AutoFormField) => {
  const hasIfCondition = field.meta?.if !== undefined
  if (!hasIfCondition)
    return true

  // 直接处理简单的 if 条件，避免推迟到子组件
  const ifValue = field.meta.if

  // 对于函数类型的条件，创建字段上下文进行计算
  if (typeof ifValue === 'function') {
    const context = {
      state: state.value,
      path: field.path,
      value: getPath(state.value, field.path),
      setValue: (v: any) => setPath(state.value, field.path, v),
    }
    return ifValue(context)
  }

  return ifValue === true
}))

// UAccordion 相关计算属性
const enableAccordionWrapper = computed(() =>
  shouldEnableAccordion(visibleFields.value, accordion),
)

// 根据是否启用 UAccordion 决定字段处理方式
const processedFields = computed(() => {
  if (enableAccordionWrapper.value) {
    // 使用 UAccordion 时，保持原有字段结构用于分组
    return groupFieldsByType(visibleFields.value)
  }
  else {
    // 不使用 UAccordion 时，展平所有字段，只显示叶子节点
    const flattened = flattenFields(visibleFields.value)
    return {
      objectFields: [],
      regularFields: flattened,
    }
  }
})

// 为 UAccordion 收集顶级对象字段（不包括嵌套的），并过滤 hidden 字段
const topLevelObjectFields = computed(() => {
  if (!enableAccordionWrapper.value) {
    return []
  }
  const fields = collectTopLevelObjectFields(visibleFields.value)

  // 过滤掉 hidden 的对象字段，提升性能
  return fields.filter((field) => {
    const hiddenValue = field.meta?.hidden
    if (hiddenValue === undefined) return true

    // 创建字段上下文来计算 hidden 属性
    const context = {
      state: state.value,
      path: field.path,
      value: getPath(state.value, field.path),
      setValue: (v: any) => setPath(state.value, field.path, v),
    }

    const isHidden = typeof hiddenValue === 'function' ? hiddenValue(context) : hiddenValue
    return !isHidden
  })
})

const accordionItems = computed(() => {
  if (!enableAccordionWrapper.value || topLevelObjectFields.value.length === 0) {
    return []
  }
  return generateAccordionItems(topLevelObjectFields.value, accordion)
})

// 字段属性解析逻辑已移至 useFieldRenderer composable
const { resolveFieldProp } = useFieldRenderer()

// 创建插槽解析器
function createSlotResolver(field: AutoFormField) {
  const keyPrefix = field.path

  return {
    hasSlot(name: string): boolean {
      const keySpecific = `${name}:${keyPrefix}`
      return Boolean(
        _slots?.[keySpecific]
        || _slots?.[name]
      )
    },

    renderSlot(name: string, slotProps: any) {
      const keySpecific = `${name}:${keyPrefix}`

      if (_slots?.[keySpecific]) {
        return _slots[keySpecific](slotProps)
      }

      if (_slots?.[name]) {
        return _slots[name](slotProps)
      }

      return null
    }
  }
}
</script>

<template>
  <UForm
    :state="state"
    :schema="unref(schema)"
    v-bind="restProps"
    @submit="emit('submit', $event)"
    @error="emit('error', $event)"
  >
    <slot name="before-fields" :fields="visibleFields" :state="state" />

    <!-- 使用 UAccordion 包装的情况 -->
    <template v-if="enableAccordionWrapper">
      <!-- 渲染非对象字段 -->
      <TransitionGroup
        v-if="processedFields.regularFields.length > 0"
        :name="enableTransition ? 'auto-form-field' : ''"
        :duration="{ enter: 350, leave: 250 }"
      >
        <template v-for="field in processedFields.regularFields" :key="field.path">
          <AutoFormFieldRenderer :field="field" :schema="schema" :name="name" :size="size" />
        </template>
      </TransitionGroup>

      <!-- UAccordion 包装对象字段 -->
      <UAccordion
        v-if="accordionItems.length > 0"
        :items="accordionItems"
        v-bind="accordion?.props"
      >
        <!-- 为每个顶级对象字段创建对应的内容插槽 -->
        <template
          v-for="objectField in topLevelObjectFields"
          :key="`content-${objectField.path}`"
          #[`content-${objectField.path}`]
        >
          <!-- 在 UAccordion 内容中包装 UFormField，提供完整的字段功能 -->
          <UFormField
            v-show="!resolveFieldProp(objectField, 'hidden')"
            :name="objectField.path"
            :as="resolveFieldProp(objectField, 'as')"
            :error-pattern="resolveFieldProp(objectField, 'errorPattern')"
            :label="resolveFieldProp(objectField, 'label')"
            :description="resolveFieldProp(objectField, 'description')"
            :help="resolveFieldProp(objectField, 'help')"
            :hint="resolveFieldProp(objectField, 'hint')"
            :size="resolveFieldProp(objectField, 'size', size)"
            :required="resolveFieldProp(objectField, 'required')"
            :eager-validation="resolveFieldProp(objectField, 'eagerValidation')"
            :validate-on-input-delay="resolveFieldProp(objectField, 'validateOnInputDelay')"
            :class="resolveFieldProp(objectField, 'class')"
            :ui="resolveFieldProp(objectField, 'ui')"
          >
            <!-- 对象字段的插槽支持 -->
            <template v-if="createSlotResolver(objectField).hasSlot('label')" #label="{ label }">
              <VNodeRender
                :node="createSlotResolver(objectField).renderSlot('label', {
                  label: label || resolveFieldProp(objectField, 'label'),
                  state,
                  path: objectField.path,
                  value: getPath(state, objectField.path),
                  setValue: (v: any) => setPath(state, objectField.path, v)
                })"
              />
            </template>
            <template v-if="createSlotResolver(objectField).hasSlot('hint')" #hint="{ hint }">
              <VNodeRender
                :node="createSlotResolver(objectField).renderSlot('hint', {
                  hint: hint || resolveFieldProp(objectField, 'hint'),
                  state,
                  path: objectField.path,
                  value: getPath(state, objectField.path),
                  setValue: (v: any) => setPath(state, objectField.path, v)
                })"
              />
            </template>
            <template v-if="createSlotResolver(objectField).hasSlot('description')" #description="{ description }">
              <VNodeRender
                :node="createSlotResolver(objectField).renderSlot('description', {
                  description: description || resolveFieldProp(objectField, 'description'),
                  state,
                  path: objectField.path,
                  value: getPath(state, objectField.path),
                  setValue: (v: any) => setPath(state, objectField.path, v)
                })"
              />
            </template>
            <template v-if="createSlotResolver(objectField).hasSlot('help')" #help="{ help }">
              <VNodeRender
                :node="createSlotResolver(objectField).renderSlot('help', {
                  help: help || resolveFieldProp(objectField, 'help'),
                  state,
                  path: objectField.path,
                  value: getPath(state, objectField.path),
                  setValue: (v: any) => setPath(state, objectField.path, v)
                })"
              />
            </template>
            <template v-if="createSlotResolver(objectField).hasSlot('error')" #error="{ error }">
              <VNodeRender
                :node="createSlotResolver(objectField).renderSlot('error', {
                  error,
                  state,
                  path: objectField.path,
                  value: getPath(state, objectField.path),
                  setValue: (v: any) => setPath(state, objectField.path, v)
                })"
              />
            </template>

            <!-- 使用嵌套渲染器处理对象字段的内容 -->
            <AutoFormNestedRenderer
              v-if="objectField.children"
              :fields="objectField.children"
              :schema="schema"
              :name="name"
              :size="size"
              :enable-transition="enableTransition"
              :accordion="accordion"
            />
          </UFormField>
        </template>
      </UAccordion>
    </template>

    <!-- 不使用 UAccordion 包装的情况（原有逻辑） -->
    <template v-else>
      <TransitionGroup :name="enableTransition ? 'auto-form-field' : ''" :duration="{ enter: 350, leave: 250 }">
        <template v-for="field in processedFields.regularFields" :key="field.path">
          <AutoFormFieldRenderer :field="field" :schema="schema" :name="name" :size="size" />
        </template>
      </TransitionGroup>
    </template>

    <slot name="after-fields" :fields="visibleFields" :state="state" />
    <!-- <slot name="submit" :state="state" /> -->
  </UForm>
</template>
