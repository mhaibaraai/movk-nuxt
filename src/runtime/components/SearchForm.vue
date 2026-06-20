<script lang="ts" setup generic="S extends z.ZodObject">
import type { ComponentConfig, FormError, InferInput } from '@nuxt/ui'
import type { z } from 'zod'
import type { CSSProperties, Ref } from 'vue'
import type { AppConfig } from 'nuxt/schema'
import { UButton, UCollapsible, UForm } from '#components'
import { computed, onMounted, ref, toRaw, unref, useAttrs, useTemplateRef, watch } from 'vue'
import { deepClone, isFunction } from '@movk/core'
import { useAutoFormProvider } from '../domains/auto-form/provider'
import { extractPureSchema, introspectSchema } from '../domains/auto-form/schema'
import { applyFieldDefaults } from '../domains/auto-form/fields'
import { DEFAULT_CONTROLS } from '../domains/auto-form/controls'
import { DEFAULT_SEARCH_ACTIONS } from '../domains/auto-form/actions'
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
import { useExtendedTv } from '../utils/extend-theme'

const props = withDefaults(defineProps<SearchFormProps<S> & {
  ui?: ComponentConfig<typeof theme, AppConfig, 'searchForm'>['slots']
}>(), {
  cols: 3,
  visibleRows: 1,
  icon: 'i-lucide-chevron-down',
  expandText: '展开',
  collapseText: '收起',
  defaultExpanded: false,
  loadingAuto: true,
  validateOn: () => []
})

const modelValue = defineModel<Partial<InferInput<S>>>({ default: () => ({}) })
const expandedModel = defineModel<boolean>('expanded')
const emits = defineEmits<SearchFormEmits<S>>()
const slots = defineSlots<SearchFormSlots<S>>()
defineOptions({ inheritAttrs: false })

const attrs = useAttrs()

let baseline = deepClone(toRaw(modelValue.value)) as Partial<InferInput<S>>

const appConfig = useAppConfig() as {
  movk?: { searchForm?: unknown }
}

const formRef = useTemplateRef('formRef')
const internalExpanded = ref<boolean>(props.defaultExpanded ?? false)

const expanded = computed<boolean>({
  get: () => expandedModel.value ?? internalExpanded.value,
  set: (val) => {
    internalExpanded.value = val
    if (expandedModel.value !== undefined) {
      expandedModel.value = val
    }
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

function maxCols(cols: SearchFormProps<S>['cols']): number {
  if (typeof cols === 'number') return cols
  if (!cols) return 1
  return Math.max(cols.sm ?? 1, cols.md ?? 1, cols.lg ?? 1, cols.xl ?? 1)
}

const gridStyle = computed<CSSProperties>(() => {
  const c = props.cols
  const vars: Record<string, string> = {}
  if (typeof c === 'number') {
    vars['--m-search-cols'] = String(c)
  }
  else if (c) {
    const base = c.sm ?? c.md ?? c.lg ?? c.xl ?? 1
    vars['--m-search-cols'] = String(base)
    if (c.sm !== undefined) vars['--m-search-cols-sm'] = String(c.sm)
    if (c.md !== undefined) vars['--m-search-cols-md'] = String(c.md)
    if (c.lg !== undefined) vars['--m-search-cols-lg'] = String(c.lg)
    if (c.xl !== undefined) vars['--m-search-cols-xl'] = String(c.xl)
  }
  return vars as CSSProperties
})

useAutoFormProvider(modelValue as Ref<unknown>, slots)

const resolvedButtonSize = computed(() => {
  const size = props.globalMeta?.size
  if (size === undefined || isFunction(size)) return undefined
  return unref(size)
})

const pureSchema = computed(() => extractPureSchema(props.schema) as S)

const controlsMapping = computed(() => ({ ...DEFAULT_CONTROLS, ...props.controls }))
const fields = computed(() => introspectSchema(props.schema, controlsMapping.value, '', props.globalMeta))

const actionsBag = { toggle, search: submit, reset, clear } as const

function buildSlotProps(errors: FormError[], loading: boolean): SearchFormSlotProps<S> {
  return {
    ...actionsBag,
    expanded: expanded.value,
    loading: props.loading || loading,
    state: modelValue.value,
    errors
  }
}

function resolveActions(slotCtx: SearchFormSlotProps<S>): SearchFormAction[] {
  const list = props.actions ?? DEFAULT_SEARCH_ACTIONS
  return list.filter((action) => {
    if (action.visible === undefined) return true
    if (typeof action.visible === 'function') {
      return action.visible(slotCtx as SearchFormSlotProps<z.ZodObject>)
    }
    return action.visible
  })
}

const showActionsCell = computed(() => {
  const list = props.actions ?? DEFAULT_SEARCH_ACTIONS
  return list.length > 0 || !!slots.actions || !!slots.extraActions
})

const visibleCount = computed(() => {
  const total = maxCols(props.cols) * props.visibleRows
  if (!showActionsCell.value) return total
  if (maxCols(props.cols) <= 1) return total
  return Math.max(0, total - 1)
})

const visibleFields = computed(() => fields.value.slice(0, visibleCount.value))
const collapsedFields = computed(() => fields.value.slice(visibleCount.value))
const needsCollapse = computed(() => collapsedFields.value.length > 0)

function toggle() {
  const next = !expanded.value
  expanded.value = next
  emits('expand', next)
  emits('update:expanded', next)
}

function submit() {
  formRef.value?.submit()
}

// 覆盖全部 schema 字段的载荷：清空字段为 undefined，有默认值的字段为其默认值，
// 供合并语义的消费方（handleSearch）据此覆盖每个搜索字段
function buildFieldPayload(): Partial<InferInput<S>> {
  const keys = Object.keys(props.schema.shape) as (keyof InferInput<S>)[]
  return keys.reduce((acc, key) => {
    acc[key] = modelValue.value[key]
    return acc
  }, {} as Partial<InferInput<S>>)
}

function clear() {
  modelValue.value = {} as Partial<InferInput<S>>
  formRef.value?.clear()
  emits('clear', buildFieldPayload())
}

function reset() {
  modelValue.value = deepClone(baseline)
  applyFieldDefaults(fields.value, modelValue.value)
  formRef.value?.clear()
  emits('reset', buildFieldPayload())
}

function setBaseline(value?: Partial<InferInput<S>>) {
  baseline = deepClone(toRaw(value ?? modelValue.value)) as Partial<InferInput<S>>
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

function actionLoading(action: SearchFormAction, ctx: SearchFormSlotProps<S>): boolean {
  if (action.key === 'search' || action.type === 'submit') return ctx.loading
  return false
}

watch(() => fields.value, () => {
  applyFieldDefaults(fields.value, modelValue.value)
}, { flush: 'post' })

watch(() => props.schema, () => {
  formRef.value?.clear()
})

onMounted(() => {
  applyFieldDefaults(fields.value, modelValue.value)
  setBaseline()
})

defineExpose({
  formRef,
  submit,
  reset,
  clear,
  setBaseline,
  expanded,
  toggle
})
</script>

<template>
  <div :class="extraUi.root" data-slot="root">
    <UForm
      ref="formRef"
      :state="modelValue"
      :schema="pureSchema"
      :loading-auto="props.loadingAuto"
      :validate-on="props.validateOn"
      :ui="baseUi"
      data-slot="form"
      v-bind="attrs"
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
              :schema="props.schema"
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
                    :label="action.label"
                    :type="action.type"
                    :icon="action.icon"
                    :color="action.color"
                    :variant="action.variant"
                    :loading="actionLoading(action, buildSlotProps(errors, loading))"
                    :size="resolvedButtonSize"
                    v-bind="action"
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
                :schema="props.schema"
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
            :label="expanded ? collapseText : expandText"
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
