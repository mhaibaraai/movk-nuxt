<script lang="ts">
import type { ButtonProps, ComponentConfig, FormInputEvents, FormProps, InferInput } from '@nuxt/ui'
import type { z } from 'zod'
import type { ZodAutoFormFieldMeta } from '../types/zod'
import type { AutoFormControls, DynamicFormSlots } from '../types/auto-form'
import type { Ref } from 'vue'
import type { OmitByKey } from '@movk/core'
import type { AppConfig } from 'nuxt/schema'
import theme from '#build/movk-ui/search-form'

type SearchForm = ComponentConfig<typeof theme, AppConfig, 'searchForm'>

export interface SearchFormProps<S extends z.ZodObject, T extends boolean = true, N extends boolean = false> extends /** @vue-ignore */ OmitByKey<FormProps<S, T, N>, 'schema' | 'state' | 'validateOn' | 'ui'> {
  /** Zod 对象 schema，定义搜索字段 */
  schema: S
  /** 搜索表单的状态对象。 */
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
  /** 自定义控件映射（复用 AutoForm 的控件系统） */
  controls?: AutoFormControls
  /** 全局字段元数据 */
  globalMeta?: ZodAutoFormFieldMeta
  /** 搜索按钮属性 */
  searchButtonProps?: ButtonProps
  /**  重置按钮属性 */
  resetButtonProps?: ButtonProps
  /** 收起按钮属性 */
  collapseButtonProps?: ButtonProps
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
   * 表单验证时机，详见 UForm 的 validateOn 属性
   * @defaultValue []
   */
  validateOn?: FormInputEvents[]
  ui?: SearchForm['slots']
}

export interface SearchFormActionSlots {
  actions: (props: {
    expanded: boolean
    toggle: () => void
    search: () => void
    reset: () => void
    loading: boolean
  }) => any
  extraActions: (props: { expanded: boolean }) => any
}

export interface SearchFormEmits<S extends z.ZodObject> {
  search: [value: Partial<InferInput<S>>]
  reset: []
  expand: [expanded: boolean]
}

type SearchFormSlotTypes<S extends z.ZodObject> = SearchFormActionSlots & DynamicFormSlots<Partial<InferInput<S>>>
type SearchFormStateType<S extends z.ZodObject> = Partial<InferInput<S>>
</script>

<script lang="ts" setup generic="S extends z.ZodObject, T extends boolean = true, N extends boolean = false">
import { UButton, UCollapsible, UForm } from '#components'
import { computed, ref, unref, useAttrs, useTemplateRef, watch } from 'vue'
import { isFunction } from '@movk/core'
import { useAutoFormProvider } from '../domains/auto-form/provider'
import { extractPureSchema, introspectSchema } from '../domains/auto-form/schema'
import { useAutoForm } from '../composables/useAutoForm'
import AutoFormRendererField from './auto-form-renderer/AutoFormRendererField.vue'
import { useAppConfig } from '#app'
import { tv } from '../utils/tv'

const props = withDefaults(defineProps<SearchFormProps<S, T, N>>(), {
  cols: 3,
  visibleRows: 1,
  icon: 'i-lucide-chevron-down',
  expandText: '展开',
  collapseText: '收起',
  defaultExpanded: false,
  searchText: '搜索',
  resetText: '重置',
  showSearchButton: true,
  showResetButton: true,
  loading: false,
  validateOn: () => []
})
const modelValue = defineModel<SearchFormStateType<S>>()
const emits = defineEmits<SearchFormEmits<S>>()
const slots = defineSlots<SearchFormSlotTypes<S>>()
defineOptions({ inheritAttrs: false })

const attrs = useAttrs()

const stateModel = ref(modelValue.value ?? props.state ?? {}) as Ref<SearchFormStateType<S>>
const initialState = { ...(modelValue.value ?? props.state ?? {}) } as SearchFormStateType<S>

watch(() => stateModel.value, (val) => {
  if (val !== modelValue.value) {
    modelValue.value = val
  }
}, { deep: true })

watch(() => modelValue.value, (val) => {
  if (val !== undefined && val !== stateModel.value) {
    stateModel.value = (val ?? {}) as SearchFormStateType<S>
  }
})

const appConfig = useAppConfig() as SearchForm['AppConfig']
const formRef = useTemplateRef('formRef')
const expanded = ref(props.defaultExpanded)

type ColsConfig = { sm?: number, md?: number, lg?: number, xl?: number }

function maxCols(cols: number | ColsConfig): number {
  if (typeof cols === 'number') return cols
  return Math.max(cols.sm ?? 1, cols.md ?? 1, cols.lg ?? 1, cols.xl ?? 1)
}

const colsVariants = computed(() => {
  const c = props.cols
  if (typeof c === 'number') return { cols: c }
  return { cols: 1, smCols: c.sm, mdCols: c.md, lgCols: c.lg, xlCols: c.xl }
})

const uiCls = computed(() =>
  tv({ extend: tv(theme), ...(appConfig.movk?.searchForm || {}) })(colsVariants.value)
)

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

const visibleCount = computed(() => {
  const base = maxCols(props.cols) * props.visibleRows
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
  stateModel.value = {} as SearchFormStateType<S>
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
    :ui="{ base: uiCls.base({ class: props.ui?.base }) }"
    v-bind="attrs"
    @submit="handleSearch"
  >
    <template #default="{ errors, loading: formLoading }">
      <div :class="uiCls.root({ class: props.ui?.root })">
        <div :class="uiCls.inner({ class: props.ui?.inner })">
          <div :class="uiCls.grid({ class: props.ui?.grid })">
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
              <div :class="uiCls.actionWrapper({ class: props.ui?.actionWrapper })">
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
            :class="uiCls.toggleWrapper({ class: props.ui?.toggleWrapper })"
          >
            <UButton
              :icon="icon || appConfig.ui.icons.chevronDown"
              color="neutral"
              :size="resolvedButtonSize"
              variant="ghost"
              :data-state="expanded ? 'open' : 'closed'"
              :label="expanded ? collapseText : expandText"
              tabindex="-1"
              :ui="{ leadingIcon: 'size-3.5 group-data-[state=open]:rotate-180 transition-transform duration-200' }"
              :class="uiCls.toggle({ class: props.ui?.toggle })"
              v-bind="collapseButtonProps"
              @click="toggle"
            />
          </div>
        </div>

        <UCollapsible v-if="needsCollapse" v-model:open="expanded">
          <template #content>
            <div :class="[uiCls.grid({ class: props.ui?.grid }), uiCls.collapsedContent({ class: props.ui?.collapsedContent })]">
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
