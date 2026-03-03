<script setup lang="ts" generic="S extends z.ZodObject, T extends boolean = true, N extends boolean = false">
import type { ButtonProps, FormProps, InferInput } from '@nuxt/ui'
import type { z } from 'zod'
import type { ZodAutoFormFieldMeta } from '../types/zod'
import type { AutoFormControls, DynamicFormSlots } from '../types/auto-form'
import { UButton, UCollapsible, UForm } from '#components'
import type { Ref } from 'vue'
import { computed, ref, useSlots, useTemplateRef, watch } from 'vue'
import { useAutoFormProvider } from '../internal/useAutoFormProvider'
import { extractPureSchema, introspectSchema } from '../utils/auto-form'
import { useAutoForm } from '../composables/useAutoForm'
import AutoFormRendererField from './auto-form-renderer/AutoFormRendererField.vue'
import { useAppConfig } from '#app'

interface SearchFormProps<S extends z.ZodObject, T extends boolean = true, N extends boolean = false> extends FormProps<S, T, N> {
  /**
   * Zod 对象 schema，定义搜索字段
   */
  schema: S
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
}

type SearchFormStateType = Partial<InferInput<S>>

interface SearchFormActionSlots {
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

type SearchFormSlotTypes = SearchFormActionSlots & DynamicFormSlots<SearchFormStateType>

const {
  schema,
  controls,
  globalMeta,
  cols = 3,
  visibleRows = 1,
  icon = 'i-lucide-chevron-down',
  expandText = '展开',
  collapseText = '收起',
  defaultExpanded = false,
  gap = 'gap-4',
  searchText = '搜索',
  resetText = '重置',
  searchButtonProps,
  resetButtonProps,
  showSearchButton = true,
  showResetButton = true,
  loading = false,
  state: _state,
  ...restProps
} = defineProps<SearchFormProps<S, T, N>>()

const emit = defineEmits<{
  search: [value: SearchFormStateType]
  reset: []
  expand: [expanded: boolean]
}>()

const modelValue = defineModel<SearchFormStateType>()
const _slots = defineSlots<SearchFormSlotTypes>()
defineOptions({ inheritAttrs: false })

const state = ref(modelValue.value ?? _state ?? {}) as Ref<SearchFormStateType>

// v-model 双向同步
watch(state, (val) => {
  modelValue.value = val
}, { deep: true })

watch(() => modelValue.value, (val) => {
  if (val !== undefined && val !== state.value) {
    state.value = (val ?? {}) as SearchFormStateType
  }
})

const appConfig = useAppConfig()
const formRef = useTemplateRef('formRef')
const expanded = ref(defaultExpanded)
const vueSlots = useSlots()

const { DEFAULT_CONTROLS } = useAutoForm()
useAutoFormProvider(state, _slots)

// actions 区域是否需要显示
const showActionsCell = computed(() => showSearchButton || showResetButton || !!vueSlots.actions || !!vueSlots.extraActions)

// 提取纯净 schema 用于验证
const pureSchema = computed(() => schema ? extractPureSchema(schema) as S : schema)

const controlsMapping = computed(() => ({
  ...DEFAULT_CONTROLS,
  ...controls
}))

// schema 内省 → 字段列表
const fields = computed(() => {
  if (!schema) return []
  return introspectSchema(schema, controlsMapping.value, '', globalMeta)
})

// Tailwind 要求类名以完整字符串形式出现在源码中，不能动态拼接
const COLS_MAP: Record<number, string> = {
  1: 'grid-cols-1',
  2: 'grid-cols-2',
  3: 'grid-cols-3',
  4: 'grid-cols-4',
  5: 'grid-cols-5',
  6: 'grid-cols-6'
}
const SM_COLS_MAP: Record<number, string> = {
  1: 'sm:grid-cols-1',
  2: 'sm:grid-cols-2',
  3: 'sm:grid-cols-3',
  4: 'sm:grid-cols-4',
  5: 'sm:grid-cols-5',
  6: 'sm:grid-cols-6'
}
const MD_COLS_MAP: Record<number, string> = {
  1: 'md:grid-cols-1',
  2: 'md:grid-cols-2',
  3: 'md:grid-cols-3',
  4: 'md:grid-cols-4',
  5: 'md:grid-cols-5',
  6: 'md:grid-cols-6'
}
const LG_COLS_MAP: Record<number, string> = {
  1: 'lg:grid-cols-1',
  2: 'lg:grid-cols-2',
  3: 'lg:grid-cols-3',
  4: 'lg:grid-cols-4',
  5: 'lg:grid-cols-5',
  6: 'lg:grid-cols-6'
}
const XL_COLS_MAP: Record<number, string> = {
  1: 'xl:grid-cols-1',
  2: 'xl:grid-cols-2',
  3: 'xl:grid-cols-3',
  4: 'xl:grid-cols-4',
  5: 'xl:grid-cols-5',
  6: 'xl:grid-cols-6'
}

const gridClass = computed(() => {
  const classes = ['grid', gap]

  if (typeof cols === 'number') {
    classes.push(COLS_MAP[cols] ?? 'grid-cols-3')
  } else {
    classes.push('grid-cols-1')
    if (cols.sm) classes.push(SM_COLS_MAP[cols.sm] ?? '')
    if (cols.md) classes.push(MD_COLS_MAP[cols.md] ?? '')
    if (cols.lg) classes.push(LG_COLS_MAP[cols.lg] ?? '')
    if (cols.xl) classes.push(XL_COLS_MAP[cols.xl] ?? '')
  }

  return classes.join(' ')
})

// 计算可见字段数（基于最大列数）
const resolvedMaxCols = computed(() => {
  if (typeof cols === 'number') return cols
  return Math.max(cols.sm ?? 1, cols.md ?? 1, cols.lg ?? 1, cols.xl ?? 1)
})

const visibleCount = computed(() => {
  const base = resolvedMaxCols.value * visibleRows
  const adjusted = showActionsCell.value ? base - 1 : base
  return Math.max(0, adjusted)
})

const visibleFields = computed(() => fields.value.slice(0, visibleCount.value))
const collapsedFields = computed(() => fields.value.slice(visibleCount.value))
const needsCollapse = computed(() => collapsedFields.value.length > 0)

// 切换展开/收起
function toggle() {
  expanded.value = !expanded.value
  emit('expand', expanded.value)
}

function handleSearch() {
  emit('search', { ...state.value })
}

// 重置
function handleReset() {
  const keys = Object.keys(state.value)
  const cleared = {} as SearchFormStateType
  state.value = cleared

  // 清空原始 keys 触发响应式更新
  for (const key of keys) {
    // eslint-disable-next-line @typescript-eslint/no-dynamic-delete
    delete (state.value as Record<string, unknown>)[key]
  }

  formRef.value?.clear()
  emit('reset')
}

// 清空表单
function clear() {
  state.value = {} as SearchFormStateType
  formRef.value?.clear()
}

defineExpose({
  formRef,
  reset: handleReset,
  clear,
  expanded,
  toggle
})
</script>

<template>
  <UForm
    ref="formRef"
    :state="state"
    :schema="pureSchema"
    v-bind="restProps"
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
              :schema="schema"
              :extra-props="{ errors, loading: formLoading }"
            />

            <slot
              v-if="showActionsCell"
              name="actions"
              :expanded="expanded"
              :toggle="toggle"
              :search="handleSearch"
              :reset="handleReset"
              :loading="loading"
            >
              <div class="flex items-end gap-2 justify-end">
                <UButton
                  v-if="showSearchButton"
                  type="submit"
                  icon="i-lucide-search"
                  :label="searchText"
                  :loading="loading"
                  v-bind="searchButtonProps"
                />
                <UButton
                  v-if="showResetButton"
                  :label="resetText"
                  color="neutral"
                  variant="outline"
                  icon="i-lucide-rotate-ccw"
                  v-bind="resetButtonProps"
                  @click="handleReset"
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
              size="xs"
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
                :schema="schema"
                :extra-props="{ errors, loading: formLoading }"
              />
            </div>
          </template>
        </UCollapsible>
      </div>
    </template>
  </UForm>
</template>
