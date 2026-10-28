<script lang="ts" setup generic="S extends z.ZodObject">
import type { ButtonProps, ComponentConfig, FormError, FormProps, FormState, InferInput } from '@nuxt/ui'
import type { z } from 'zod'
import type { CSSProperties, Ref } from 'vue'
import type { AppConfig } from 'nuxt/schema'
import { UButton, UCollapsible, UForm } from '#components'
import { computed, ref, useAttrs, useTemplateRef, watch } from 'vue'
import { useBreakpoints } from '@vueuse/core'
import { useAutoFormCore } from '../domains/auto-form/useAutoFormCore'
import { isLeafField } from '../domains/auto-form/fields'
import { AUTOFORM_META } from '../domains/auto-form/constants'
import { createDefaultSearchActions } from '../domains/auto-form/actions'
import { useMovkLocale } from '../composables/useMovkLocale'
import AutoFormRendererField from '../domains/auto-form/components/Field.vue'
import { useAppConfig } from '#imports'
import theme from '#build/movk-ui/search-form'
import type {
  SearchFormAction,
  SearchFormEmits,
  SearchFormProps,
  SearchFormSlotProps,
  SearchFormSlots
} from '../types/auto-form/search-form'
import type { AutoFormField } from '../types/auto-form'
import { useExtendedTv } from '../utils/extend-theme'

type SearchState = Partial<InferInput<S>>
type ColsBreakpoint = 'sm' | 'md' | 'lg' | 'xl'

const BREAKPOINTS: Record<ColsBreakpoint, number> = { sm: 640, md: 768, lg: 1024, xl: 1280 }
const BREAKPOINT_KEYS = Object.keys(BREAKPOINTS) as ColsBreakpoint[]

const props = withDefaults(defineProps<SearchFormProps<S> & {
  ui?: ComponentConfig<typeof theme, AppConfig, 'searchForm'>['slots']
}>(), {
  cols: 3,
  visibleRows: 1,
  icon: 'i-lucide-chevron-down',
  defaultExpanded: false,
  loadingAuto: true,
  validateOn: () => []
})

const modelValue = defineModel<SearchState>({ default: () => ({}) })
const expandedModel = defineModel<boolean | undefined>('expanded')
const emits = defineEmits<SearchFormEmits<S>>()
const slots = defineSlots<SearchFormSlots<S>>()
defineOptions({ inheritAttrs: false })

const attrs = useAttrs()
const { t } = useMovkLocale()
const appConfig = useAppConfig() as { movk?: { searchForm?: unknown } }
const formRef = useTemplateRef('formRef')

const core = useAutoFormCore({
  schema: () => props.schema,
  controls: () => props.controls,
  globalMeta: () => props.globalMeta,
  hiddenValue: () => props.hiddenValue,
  model: modelValue as Ref<Record<string, any>>,
  slots
})
const { validationSchema, resolvedButtonSize } = core

const internalExpanded = ref(props.defaultExpanded)
const expanded = computed<boolean>({
  get: () => expandedModel.value ?? internalExpanded.value,
  set: (value: boolean) => {
    internalExpanded.value = value
    expandedModel.value = value
  }
})

const { baseUi, extraUi } = useExtendedTv(
  { slots: { base: '' } },
  theme,
  () => appConfig.movk?.searchForm,
  () => ({
    ui: {
      ...props.ui,
      root: [props.ui?.root, props.class]
    }
  })
)

const breakpoints = useBreakpoints(BREAKPOINTS)

/** 与 gridStyle 的 CSS 断点规则一致：取当前已命中的最大断点上声明的列数 */
const currentCols = computed(() => {
  const cols = props.cols
  if (typeof cols === 'number') return cols
  if (!cols) return 1
  const base = cols.sm ?? cols.md ?? cols.lg ?? cols.xl ?? 1
  return BREAKPOINT_KEYS.reduce((acc, key) =>
    cols[key] !== undefined && breakpoints.greaterOrEqual(key).value ? cols[key]! : acc, base)
})

const gridStyle = computed<CSSProperties>(() => {
  const cols = props.cols
  if (typeof cols === 'number') return { '--m-search-cols': String(cols) } as CSSProperties
  if (!cols) return {}
  const vars: Record<string, string> = { '--m-search-cols': String(cols.sm ?? cols.md ?? cols.lg ?? cols.xl ?? 1) }
  for (const key of BREAKPOINT_KEYS) {
    if (cols[key] !== undefined) vars[`--m-search-cols-${key}`] = String(cols[key])
  }
  return vars as CSSProperties
})

function isSupportedField(field: AutoFormField): boolean {
  return isLeafField(field) && field.meta?.type !== AUTOFORM_META.LAYOUT_KEY
}

watch(core.fields, (fields) => {
  const unsupported = fields.filter(field => !isSupportedField(field)).map(field => field.path)
  if (import.meta.dev && unsupported.length) {
    console.warn(`[SearchForm] Object, array and layout fields are not supported and will be skipped: ${unsupported.join(', ')}`)
  }
}, { immediate: true })

const renderFields = computed(() => core.visibleFields.value.filter(isSupportedField))

const actionList = computed(() => props.actions ?? createDefaultSearchActions(t))
const showActionsCell = computed(() => actionList.value.length > 0 || !!slots.actions || !!slots.extraActions)

const visibleCount = computed(() => {
  const total = currentCols.value * props.visibleRows
  return showActionsCell.value && currentCols.value > 1 ? Math.max(0, total - 1) : total
})

const visibleFields = computed(() => renderFields.value.slice(0, visibleCount.value))
const collapsedFields = computed(() => renderFields.value.slice(visibleCount.value))
const needsCollapse = computed(() => collapsedFields.value.length > 0)

function toggle() {
  expanded.value = !expanded.value
  emits('expand', expanded.value)
}

const submit = async () => formRef.value?.submit()
const validate = ((...args: Parameters<NonNullable<typeof formRef.value>['validate']>) =>
  formRef.value?.validate(...args)) as NonNullable<typeof formRef.value>['validate']

/**
 * 覆盖全部 schema 字段的载荷：清空字段为 undefined，有默认值的字段为其默认值，
 * 供合并语义的消费方据此覆盖每个搜索字段
 */
function buildFieldPayload(state: SearchState): SearchState {
  const keys = Object.keys(core.pureSchema.value?.shape ?? {}) as (keyof SearchState)[]
  return Object.fromEntries(keys.map(key => [key, state[key]])) as SearchState
}

function reset() {
  const next = core.reset() as SearchState
  formRef.value?.clear()
  emits('reset', buildFieldPayload(next))
}

function clear() {
  const next = core.clear() as SearchState
  formRef.value?.clear()
  emits('clear', buildFieldPayload(next))
}

function buildSlotProps(errors: FormError[], loading: boolean): SearchFormSlotProps<S> {
  return {
    toggle,
    search: submit,
    reset,
    clear,
    expanded: expanded.value,
    loading: props.loading || loading,
    state: modelValue.value,
    errors
  }
}

function resolveActions(ctx: SearchFormSlotProps<S>): SearchFormAction[] {
  return actionList.value.filter(({ visible }) =>
    typeof visible === 'function' ? visible(ctx as SearchFormSlotProps<z.ZodObject>) : visible !== false)
}

function actionButtonProps(action: SearchFormAction, ctx: SearchFormSlotProps<S>): ButtonProps {
  const { key: _key, visible: _visible, onClick: _onClick, ...rest } = action
  const isSearch = action.key === 'search' || action.type === 'submit'
  return {
    size: resolvedButtonSize.value,
    disabled: attrs.disabled as boolean | undefined,
    ...rest,
    loading: isSearch ? ctx.loading : rest.loading
  }
}

function handleAction(action: SearchFormAction, ctx: SearchFormSlotProps<S>) {
  if (action.onClick) {
    action.onClick(ctx as SearchFormSlotProps<z.ZodObject>)
    return
  }
  if (action.type === 'submit') return
  if (action.key === 'reset') reset()
  else if (action.key === 'search') submit()
}

watch(() => props.schema, () => formRef.value?.clear())

defineExpose({
  formRef,
  submit,
  validate,
  reset,
  clear,
  setBaseline: core.setBaseline,
  isDirty: core.isDirty,
  dirtyFields: core.dirtyFields,
  getFieldValue: core.getFieldValue,
  setFieldValue: core.setFieldValue,
  expanded,
  toggle
})
</script>

<template>
  <div :class="extraUi.root" data-slot="root">
    <UForm
      ref="formRef"
      :state="modelValue as FormState<S>"
      :schema="validationSchema as S"
      :loading-auto="props.loadingAuto"
      :validate-on="props.validateOn"
      :ui="baseUi"
      data-slot="form"
      v-bind="attrs"
      :on-submit="props.onSubmit as FormProps<S, boolean>['onSubmit']"
      @error="emits('error', $event)"
    >
      <template #default="{ errors, loading }">
        <div v-if="$slots.header" :class="extraUi.header" data-slot="header">
          <slot name="header" v-bind="buildSlotProps(errors, loading)" />
        </div>

        <div :class="extraUi.visible" data-slot="visible">
          <div :class="extraUi.grid" :style="gridStyle" data-slot="grid">
            <AutoFormRendererField
              v-for="field in visibleFields"
              :key="field.path"
              :field="field"
              :extra-props="{ errors, loading, state: modelValue }"
            />

            <slot
              v-if="showActionsCell"
              name="actions"
              v-bind="buildSlotProps(errors, loading)"
            >
              <div :class="extraUi.actions" data-slot="actions">
                <template v-for="action in resolveActions(buildSlotProps(errors, loading))" :key="action.key">
                  <UButton
                    v-bind="actionButtonProps(action, buildSlotProps(errors, loading))"
                    @click="handleAction(action, buildSlotProps(errors, loading))"
                  />
                </template>
                <slot name="extraActions" v-bind="buildSlotProps(errors, loading)" />
              </div>
            </slot>
          </div>
        </div>

        <UCollapsible v-if="needsCollapse" v-model:open="expanded">
          <template #content>
            <div :class="[extraUi.grid, extraUi.collapsed]" :style="gridStyle" data-slot="collapsed">
              <AutoFormRendererField
                v-for="field in collapsedFields"
                :key="field.path"
                :field="field"
                :extra-props="{ errors, loading, state: modelValue }"
              />
            </div>
          </template>
        </UCollapsible>

        <div v-if="needsCollapse" :class="extraUi.toggleWrapper" data-slot="toggle-wrapper">
          <UButton
            :icon="icon"
            color="neutral"
            :size="resolvedButtonSize"
            variant="ghost"
            :data-state="expanded ? 'open' : 'closed'"
            :label="expanded ? (collapseText ?? t('searchForm.collapse')) : (expandText ?? t('searchForm.expand'))"
            tabindex="-1"
            :class="extraUi.toggle"
            v-bind="collapseButtonProps"
            :ui="{
              ...(collapseButtonProps?.ui ?? {}),
              leadingIcon: [collapseButtonProps?.ui?.leadingIcon, extraUi.toggleIcon]
                .filter(Boolean)
                .join(' ')
            }"
            @click="toggle"
          />
        </div>

        <div v-if="$slots.footer" :class="extraUi.footer" data-slot="footer">
          <slot name="footer" v-bind="buildSlotProps(errors, loading)" />
        </div>
      </template>
    </UForm>
  </div>
</template>
