<script lang="ts" setup generic="S extends z.ZodObject, T extends boolean = true, N extends boolean = false">
import type { InferInput, ComponentConfig } from '@nuxt/ui'
import type { z } from 'zod'
import type { Ref } from 'vue'
import { UButton, UCollapsible, UForm } from '#components'
import { computed, ref, unref, useAttrs, useTemplateRef, watch } from 'vue'
import { isFunction } from '@movk/core'
import { useAutoFormProvider } from '../domains/auto-form/provider'
import { extractPureSchema, introspectSchema } from '../domains/auto-form/schema'
import { useAutoForm } from '../composables/useAutoForm'
import AutoFormRendererField from '../domains/auto-form/components/Field.vue'
import { useAppConfig } from '#app'
import theme from '#build/movk-ui/search-form'
import type { AppConfig } from 'nuxt/schema'
import type { SearchFormProps, SearchFormEmits, SearchFormSlots } from '../types/auto-form/search-form'
import { useExtendedTv } from '../utils/extend-theme'

interface _Props extends SearchFormProps<S, T, N> {
  ui?: ComponentConfig<typeof theme, AppConfig, 'searchForm'>['slots']
}

const props = withDefaults(defineProps<_Props>(), {
  cols: 3,
  visibleRows: 1,
  icon: 'i-lucide-chevron-down',
  expandText: '展开',
  collapseText: '收起',
  searchText: '搜索',
  resetText: '重置',
  showSearchButton: true,
  showResetButton: true,
  validateOn: () => []
})
const modelValue = defineModel<Partial<InferInput<S>>>()
const emits = defineEmits<SearchFormEmits<S>>()
const slots = defineSlots<SearchFormSlots<S>>()
defineOptions({ inheritAttrs: false })

const attrs = useAttrs()

const stateModel = ref(modelValue.value ?? props.state ?? {}) as Ref<Partial<InferInput<S>>>
const initialState = { ...(modelValue.value ?? props.state ?? {}) } as Partial<InferInput<S>>

watch(() => stateModel.value, (val) => {
  if (val !== modelValue.value) {
    modelValue.value = val
  }
}, { deep: true })

watch(() => modelValue.value, (val) => {
  if (val !== undefined && val !== stateModel.value) {
    stateModel.value = (val ?? {}) as Partial<InferInput<S>>
  }
})

const appConfig = useAppConfig() as { movk?: { searchForm?: unknown }, ui: { icons: Record<string, string> } }
const formRef = useTemplateRef('formRef')
const expanded = ref(props.defaultExpanded ?? false)

type ColsConfig = { sm?: number, md?: number, lg?: number, xl?: number }

function maxCols(cols: number | ColsConfig): number {
  if (typeof cols === 'number') return cols
  return Math.max(cols.sm ?? 1, cols.md ?? 1, cols.lg ?? 1, cols.xl ?? 1)
}

const colsVariants = computed(() => {
  const c = props.cols
  if (typeof c === 'number') return { cols: String(c) }
  return { cols: '1', smCols: c.sm ? String(c.sm) : undefined, mdCols: c.md ? String(c.md) : undefined, lgCols: c.lg ? String(c.lg) : undefined, xlCols: c.xl ? String(c.xl) : undefined }
})

const { extraUi } = useExtendedTv(
  { slots: {} },
  theme,
  () => appConfig.movk?.searchForm,
  () => ({
    ui: props.ui,
    variants: colsVariants.value
  })
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
  stateModel.value = {} as Partial<InferInput<S>>
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
    :ui="{
      base: extraUi.base
    }"
    v-bind="attrs"
    @submit="handleSearch"
  >
    <template #default="{ errors, loading: formLoading }">
      <div :class="extraUi.root">
        <div :class="extraUi.inner">
          <div :class="extraUi.grid">
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
              <div :class="extraUi.actionWrapper">
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

          <div v-if="needsCollapse" :class="extraUi.toggleWrapper">
            <UButton
              :icon="icon || appConfig.ui.icons.chevronDown"
              color="neutral"
              :size="resolvedButtonSize"
              variant="ghost"
              :data-state="expanded ? 'open' : 'closed'"
              :label="expanded ? collapseText : expandText"
              tabindex="-1"
              :ui="{ leadingIcon: 'size-3.5 group-data-[state=open]:rotate-180 transition-transform duration-200' }"
              :class="extraUi.toggle"
              v-bind="collapseButtonProps"
              @click="toggle"
            />
          </div>
        </div>

        <UCollapsible v-if="needsCollapse" v-model:open="expanded">
          <template #content>
            <div :class="[extraUi.grid, extraUi.collapsedContent]">
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
