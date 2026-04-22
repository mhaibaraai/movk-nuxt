<script setup lang="ts" generic="S extends z.ZodObject, T extends boolean = true, N extends boolean = false">
import type { ButtonProps, FormInputEvents, FormProps, InferInput } from '@nuxt/ui'
import type { z } from 'zod'
import type { ZodAutoFormFieldMeta } from '../types/zod'
import type { AutoFormControls, DynamicFormSlots } from '../types/auto-form'
import { UButton, UCollapsible, UForm } from '#components'
import type { Ref } from 'vue'
import { computed, ref, unref, useTemplateRef, watch } from 'vue'
import { isFunction, type OmitByKey } from '@movk/core'
import { useAutoFormProvider } from '../auto-form/provider'
import { extractPureSchema, introspectSchema } from '../auto-form/schema-introspector'
import { useAutoForm } from '../composables/useAutoForm'
import AutoFormRendererField from './auto-form-renderer/AutoFormRendererField.vue'
import { useAppConfig } from '#app'
import { resolveGridClasses, resolveMaxCols } from '../constants/grid-cols'

export interface SearchFormProps<S extends z.ZodObject, T extends boolean = true, N extends boolean = false> extends /** @vue-ignore */ OmitByKey<FormProps<S, T, N>, 'schema' | 'state' | 'validateOn'> {
  /**
   * Zod 对象 schema，定义搜索字段
   */
  schema: S
  /**
   * 搜索表单的状态对象。
   */
  state?: N extends false ? Partial<InferInput<S>> : never
  /**
   * 网格列数
   * @defaultValue 3
   */
  cols?: number | { sm?: number, md?: number, lg?: number, xl?: number }
  /**
   * 可见行数（折叠时显示的行数）
   * @defaultValue 1
   */
  visibleRows?: number
  /**
   * 自定义控件映射（复用 AutoForm 的控件系统）
   */
  controls?: AutoFormControls
  /**
   * 全局字段元数据
   */
  globalMeta?: ZodAutoFormFieldMeta
  /**
   * 搜索按钮属性
   */
  searchButtonProps?: ButtonProps
  /**
   * 重置按钮属性
   */
  resetButtonProps?: ButtonProps
  /**
   * 搜索按钮文本
   * @defaultValue '搜索'
   */
  searchText?: string
  /**
   * 重置按钮文本
   * @defaultValue '重置'
   */
  resetText?: string
  /**
   * 是否显示搜索按钮
   * @defaultValue true
   */
  showSearchButton?: boolean
  /**
   * 是否显示重置按钮
   * @defaultValue true
   */
  showResetButton?: boolean
  /**
   * 搜索按钮加载状态
   * @defaultValue false
   */
  loading?: boolean
  /**
   * 展开/收起按钮图标
   * @defaultValue 'i-lucide-chevron-down'
   */
  icon?: string
  /**
   * 展开按钮文本
   * @defaultValue '展开'
   */
  expandText?: string
  /**
   * 收起按钮文本
   * @defaultValue '收起'
   */
  collapseText?: string
  /**
   * 默认展开状态
   * @defaultValue false
   */
  defaultExpanded?: boolean
  /**
   * 网格间距
   * @defaultValue 'gap-4'
   */
  gap?: string
  /**
   * 表单验证时机，详见 UForm 的 validateOn 属性
   * @defaultValue []
   */
  validateOn?: FormInputEvents[]
}

export interface SearchFormActionSlots {
  /** 替换默认按钮区域 */
  actions: (props: {
    expanded: boolean
    toggle: () => void
    search: () => void
    reset: () => void
    loading: boolean
  }) => any
  /** 追加在默认按钮后面 */
  extraActions: (props: { expanded: boolean }) => any
}

export interface SearchFormEmits<S extends z.ZodObject> {
  /**
   * 搜索事件，参数为当前表单状态
   */
  search: [value: Partial<InferInput<S>>]
  /**
   * 重置事件，参数为空
   */
  reset: []
  /**
   * 展开/收起事件，参数为当前展开状态
   */
  expand: [expanded: boolean]
}

type SearchFormSlotTypes = SearchFormActionSlots & DynamicFormSlots<Partial<InferInput<S>>>
type SearchFormStateType = Partial<InferInput<S>>

const props = withDefaults(defineProps<SearchFormProps<S, T, N>>(), {
  cols: 3,
  visibleRows: 1,
  icon: 'i-lucide-chevron-down',
  expandText: '展开',
  collapseText: '收起',
  defaultExpanded: false,
  gap: 'gap-4',
  searchText: '搜索',
  resetText: '重置',
  showSearchButton: true,
  showResetButton: true,
  loading: false,
  validateOn: () => []
})
const modelValue = defineModel<SearchFormStateType>()
const emits = defineEmits<SearchFormEmits<S>>()
const slots = defineSlots<SearchFormSlotTypes>()
defineOptions({ inheritAttrs: false })

const stateModel = ref(modelValue.value ?? props.state ?? {}) as Ref<SearchFormStateType>
const initialState = { ...(modelValue.value ?? props.state ?? {}) } as SearchFormStateType

watch(() => stateModel.value, (val) => {
  if (val !== modelValue.value) {
    modelValue.value = val
  }
}, { deep: true })

watch(() => modelValue.value, (val) => {
  if (val !== undefined && val !== stateModel.value) {
    stateModel.value = (val ?? {}) as SearchFormStateType
  }
})

const appConfig = useAppConfig()
const formRef = useTemplateRef('formRef')
const expanded = ref(props.defaultExpanded)

const { DEFAULT_CONTROLS } = useAutoForm()
useAutoFormProvider(stateModel, slots)

const resolvedButtonSize = computed(() => {
  const size = props.globalMeta?.size
  if (size === undefined || isFunction(size)) return undefined
  return unref(size)
})

const showActionsCell = computed(() => props.showSearchButton || props.showResetButton || !!slots.actions || !!slots.extraActions)

const pureSchema = computed(() => props.schema ? extractPureSchema(props.schema) as S : props.schema)

const controlsMapping = computed(() => ({
  ...DEFAULT_CONTROLS,
  ...props.controls
}))

const fields = computed(() => {
  if (!props.schema) return []
  return introspectSchema(props.schema, controlsMapping.value, '', props.globalMeta)
})

const gridClass = computed(() => resolveGridClasses(props.cols, props.gap))

const visibleCount = computed(() => {
  const base = resolveMaxCols(props.cols) * props.visibleRows
  return Math.max(0, showActionsCell.value ? base - 1 : base)
})

const visibleFields = computed(() => fields.value.slice(0, visibleCount.value))
const collapsedFields = computed(() => fields.value.slice(visibleCount.value))
const needsCollapse = computed(() => collapsedFields.value.length > 0)

function toggle() {
  expanded.value = !expanded.value
  emits('expand', expanded.value)
}

function handleSearch() {
  emits('search', { ...stateModel.value })
}

function triggerSearch() {
  formRef.value?.submit()
}

function clear() {
  stateModel.value = {} as SearchFormStateType
  formRef.value?.clear()
}

function reset() {
  stateModel.value = { ...initialState }
  formRef.value?.clear()
  emits('reset')
}

defineExpose({
  formRef,
  reset,
  clear,
  expanded,
  toggle
})
</script>

<template>
  <UForm
    ref="formRef"
    :state="stateModel"
    :schema="pureSchema"
    :validate-on="props.validateOn"
    v-bind="$attrs"
    @submit="handleSearch"
  >
    <template #default="{ errors, loading: formLoading }">
      <div class="group/search pb-6 -mb-6">
        <div class="relative">
          <div :class="gridClass">
            <AutoFormRendererField
              v-for="field in visibleFields"
              :key="field.path"
              :field="field"
              :schema="props.schema"
              :extra-props="{ errors, loading: formLoading, state: stateModel }"
            />

            <slot
              v-if="showActionsCell"
              name="actions"
              :expanded="expanded"
              :toggle="toggle"
              :search="triggerSearch"
              :reset="reset"
              :loading="loading"
            >
              <div class="flex items-end gap-2 justify-end">
                <UButton
                  v-if="showSearchButton"
                  type="submit"
                  icon="i-lucide-search"
                  :label="searchText"
                  :loading="loading"
                  :size="resolvedButtonSize"
                  v-bind="searchButtonProps"
                />
                <UButton
                  v-if="showResetButton"
                  :label="resetText"
                  color="neutral"
                  variant="outline"
                  icon="i-lucide-rotate-ccw"
                  :size="resolvedButtonSize"
                  v-bind="resetButtonProps"
                  @click="reset"
                />
                <slot name="extraActions" :expanded="expanded" />
              </div>
            </slot>
          </div>

          <div
            v-if="needsCollapse"
            class="absolute inset-x-0 top-full flex justify-center pointer-events-none z-10"
          >
            <UButton
              :icon="icon || appConfig.ui.icons.chevronDown"
              color="neutral"
              :size="resolvedButtonSize ?? 'xs'"
              variant="ghost"
              :data-state="expanded ? 'open' : 'closed'"
              :label="expanded ? collapseText : expandText"
              tabindex="-1"
              class="group pointer-events-auto opacity-30 group-hover/search:opacity-100 transition-opacity duration-200"
              :ui="{ leadingIcon: 'size-3.5 group-data-[state=open]:rotate-180 transition-transform duration-200' }"
              @click="toggle"
            />
          </div>
        </div>

        <UCollapsible v-if="needsCollapse" v-model:open="expanded">
          <template #content>
            <div :class="gridClass" class="mt-4">
              <AutoFormRendererField
                v-for="field in collapsedFields"
                :key="field.path"
                :field="field"
                :schema="props.schema"
                :extra-props="{ errors, loading: formLoading, state: stateModel }"
              />
            </div>
          </template>
        </UCollapsible>
      </div>
    </template>
  </UForm>
</template>
