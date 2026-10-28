import type { ComputedRef, Ref } from 'vue'
import type { ButtonProps } from '@nuxt/ui'
import type { z } from 'zod'
import type { AutoFormControls, AutoFormField } from '../../types/auto-form'
import type { ZodAutoFormFieldMeta } from '../../types/zod'
import { computed, onMounted, shallowRef, toRaw, unref, watch } from 'vue'
import { deepClone, getPath, isDeepEqual, isFunction, setPath } from '@movk/core'
import { useAutoFormProvider } from './provider'
import { applyFieldDefaults, isLeafField } from './fields'
import { extractPureSchema, introspectSchema, omitPaths } from './schema'
import { DEFAULT_CONTROLS } from './controls'
import { AUTOFORM_META } from './constants'
import { useZodLocaleSync } from '../zod/sync'

type FormState = Record<string, any>

export interface AutoFormCoreOptions {
  schema: () => z.ZodObject | undefined
  controls: () => AutoFormControls | undefined
  globalMeta: () => ZodAutoFormFieldMeta | undefined
  /** 字段被 `if` 隐藏时如何处理其值 */
  hiddenValue: () => 'keep' | 'clear' | undefined
  model: Ref<FormState>
  slots: Record<string, any>
  addButtonProps?: () => ButtonProps | undefined
}

/** 字段树中被 `if` 隐藏的路径；隐藏的 layout 展开为其子字段路径（layout 自身不在校验 schema 中） */
function collectHiddenPaths(fields: AutoFormField[], isVisible: (field: AutoFormField) => boolean): string[] {
  return fields.flatMap((field) => {
    const isLayout = field.meta?.type === AUTOFORM_META.LAYOUT_KEY
    if (!isVisible(field)) {
      return isLayout ? (field.children ?? []).map(child => child.path) : [field.path]
    }
    return field.children ? collectHiddenPaths(field.children, isVisible) : []
  })
}

/** 可比较取值的字段路径：叶子与数组整体，嵌套对象与 layout 继续向下展开 */
function collectValuePaths(fields: AutoFormField[]): string[] {
  return fields.flatMap((field) => {
    const isContainer = field.meta?.type === AUTOFORM_META.LAYOUT_KEY || (!isLeafField(field) && field.meta?.type !== 'array')
    return isContainer && field.children ? collectValuePaths(field.children) : [field.path]
  })
}

/** AutoForm 与 SearchForm 共用的字段解析、可见性、校验 schema、基线与 reset/clear 语义 */
export function useAutoFormCore(options: AutoFormCoreOptions) {
  const { model, slots } = options
  const provider = useAutoFormProvider(model, slots, { addButtonProps: options.addButtonProps })
  const { resolveFieldProp, isFieldVisible } = provider
  useZodLocaleSync()

  const controlsMapping = computed(() => ({ ...DEFAULT_CONTROLS, ...options.controls() }))
  const fields = computed<AutoFormField[]>(() => {
    const schema = options.schema()
    return schema ? introspectSchema(schema, controlsMapping.value, '', options.globalMeta()) : []
  })

  const visibleFields = computed(() => fields.value.filter(isFieldVisible))
  const hiddenPaths = computed(() => collectHiddenPaths(fields.value, isFieldVisible))

  const pureSchema = computed(() => {
    const schema = options.schema()
    return schema ? extractPureSchema(schema) : undefined
  })
  const validationSchema = computed(() => pureSchema.value && omitPaths(pureSchema.value, hiddenPaths.value))

  const resolvedButtonSize = computed(() => {
    const size = options.globalMeta()?.size
    if (size === undefined || isFunction(size)) return undefined
    return unref(size)
  })

  const baseline = shallowRef<FormState>(deepClone(toRaw(model.value ?? {})))

  function setBaseline(value: FormState = model.value): void {
    baseline.value = deepClone(toRaw(value))
  }

  function withDefaults(state: FormState): FormState {
    const next = deepClone(state)
    applyFieldDefaults(fields.value, next)
    return next
  }

  /**
   * 原地替换状态内容并返回快照。保持对象引用不变，
   * 使 `v-model` 绑定 `reactive()` 常量与绑定 `ref` 时行为一致
   */
  function replaceState(next: FormState): FormState {
    const target = model.value
    for (const key of Object.keys(target)) Reflect.deleteProperty(target, key)
    Object.assign(target, next)
    return deepClone(next)
  }

  /** 恢复为基线加字段默认值 */
  const reset = (): FormState => replaceState(withDefaults(baseline.value))

  /** 清空为仅含字段默认值 */
  const clear = (): FormState => replaceState(withDefaults({}))

  const valuePaths = computed(() => collectValuePaths(fields.value))

  const dirtyFields: ComputedRef<string[]> = computed(() => valuePaths.value.filter(path =>
    !isDeepEqual(getPath(model.value, path), getPath(baseline.value, path))
  ))
  const isDirty = computed(() => dirtyFields.value.length > 0)

  watch(hiddenPaths, (paths, previous = []) => {
    const added = paths.filter(path => !previous.includes(path))
    if (!added.length) return
    for (const path of added) {
      const field = findField(fields.value, path)
      const policy = (field && resolveFieldProp<'keep' | 'clear'>(field, 'hiddenValue')) ?? options.hiddenValue() ?? 'keep'
      if (policy === 'clear' && getPath(model.value, path) !== undefined) setPath(model.value, path, undefined)
    }
  })

  watch(fields, value => applyFieldDefaults(value, model.value), { flush: 'post' })

  onMounted(() => {
    applyFieldDefaults(fields.value, model.value)
    setBaseline()
  })

  const getFieldValue = (path: string): unknown => getPath(model.value, path)
  const setFieldValue = (path: string, value: unknown): void => {
    setPath(model.value, path, value)
  }

  return {
    provider,
    fields,
    visibleFields,
    isFieldVisible,
    pureSchema,
    validationSchema,
    resolvedButtonSize,
    setBaseline,
    reset,
    clear,
    dirtyFields,
    isDirty,
    getFieldValue,
    setFieldValue
  }
}

function findField(fields: AutoFormField[], path: string): AutoFormField | undefined {
  for (const field of fields) {
    if (field.path === path) return field
    const found = field.children && findField(field.children, path)
    if (found) return found
  }
}
