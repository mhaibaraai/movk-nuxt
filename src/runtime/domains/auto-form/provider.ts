import type { InjectionKey, Ref } from 'vue'
import type { AutoFormField, AutoFormFieldContext } from '../../types/auto-form'
import { UIcon } from '#components'
import defu from 'defu'
import { computed, h, inject, isVNode, provide, resolveDynamicComponent, unref } from 'vue'
import { getPath, setPath } from '@movk/core'
import { enhanceEventProps, resolveReactiveValue } from './reactive'

type AutoFormProvider = ReturnType<typeof useAutoFormProvider>

const AUTO_FORM_CONTEXT_KEY: InjectionKey<AutoFormProvider> = Symbol('AUTO_FORM_CONTEXT_KEY')

/** 初始化表单上下文工厂并通过 provide 注入给所有子渲染器 */
export function useAutoFormProvider<T extends Record<string, any>>(
  state: Ref<T>,
  slots: Record<string, any>
) {
  /** 为单个字段构建运行时上下文（value/setValue/errors/loading/open） */
  function createFieldContext(field: AutoFormField, extraProps?: Record<string, any>): AutoFormFieldContext {
    const path = field.path

    const context: AutoFormFieldContext = {
      get state() { return state.value as T },
      path,
      get value() { return getPath(state.value, path) },
      setValue: (pathOrValue: any, value?: any) => {
        if (value === undefined) {
          setPath(state.value, path, pathOrValue)
        }
        else {
          const relativePath = String(pathOrValue)

          let fullPath: string
          if (relativePath.startsWith('[')) {
            fullPath = path ? `${path}${relativePath}` : relativePath
          }
          else if (path && relativePath) {
            fullPath = `${path}.${relativePath}`
          }
          else {
            fullPath = relativePath || path
          }

          setPath(state.value, fullPath, value)
        }
      },
      get errors() { return extraProps?.errors ?? [] },
      get loading() { return extraProps?.loading ?? false },
      get open() { return extraProps?.open },
      count: extraProps?.count
    }

    return context
  }

  /** 读取字段 meta 中的属性，若为响应式值则以当前 context 求值 */
  function resolveFieldProp<T = any>(field: AutoFormField, prop: string, defaultValue?: T, extraProps?: Record<string, any>): T | undefined {
    const value = field.meta?.[prop]
    if (value === undefined)
      return defaultValue

    const valueType = typeof value
    if (valueType !== 'function' && valueType !== 'object') {
      return value as T
    }

    const context = createFieldContext(field, extraProps)
    const result = resolveReactiveValue(value, context)
    return result ?? defaultValue
  }

  function renderFieldSlot(fn?: (props?: any) => any, slotProps?: any) {
    return fn ? fn(slotProps) : null
  }

  function getResolvedFieldSlots(field: AutoFormField, extraProps?: Record<string, any>) {
    if (!field.meta?.fieldSlots)
      return undefined
    return resolveFieldProp(field, 'fieldSlots', undefined, extraProps)
  }

  /** 渲染字段对应的输入控件，合并 controlProps/controlSlots 并绑定双向绑定逻辑 */
  function renderControl(field: AutoFormField, extraProps?: Record<string, any>) {
    const controlMeta = field?.meta
    const comp = controlMeta?.component as any

    if (field.meta.type === 'object' || field.meta.type === 'array')
      return null

    if (!comp) {
      return h('div', { class: 'text-red-500' }, `[AutoForm] 控件未映射: ${field?.path ?? ''} - 类型: ${field?.meta?.type ?? 'unknown'}`)
    }

    if (isVNode(comp))
      return comp

    const component = typeof comp === 'string' ? resolveDynamicComponent(comp) : comp
    const context = createFieldContext(field, extraProps)
    const resolvedControlProps = resolveFieldProp(field, 'controlProps', undefined, extraProps) || {}
    const isReadonly = field.decorators?.isReadonly
    // size 双向注入：UFormField 用于 label/spacing，controlProps.size 透传到控件本体，由叶子组件 useFieldControl 与 UFieldGroup 合并
    const resolvedSize = resolveFieldProp(field, 'size', undefined, extraProps)

    const finalProps = defu(
      resolvedControlProps,
      isReadonly ? { disabled: true } : {},
      controlMeta?.mapped?.controlProps || {},
      resolvedSize !== undefined ? { size: resolvedSize } : {}
    )

    const slots = defu(
      resolveFieldProp(field, 'controlSlots', undefined, extraProps) || {},
      controlMeta?.mapped?.controlSlots
    )

    const userOnUpdate = (finalProps as any)['onUpdate:modelValue']
    const wrappedProps = enhanceEventProps(finalProps, context)

    delete wrappedProps['onUpdate:modelValue']

    return h(
      component as any,
      {
        ...wrappedProps,
        'onUpdate:modelValue': (v: any) => {
          context.setValue(v)
          if (typeof userOnUpdate === 'function') {
            userOnUpdate(v, context)
          }
        },
        'modelValue': unref(context.value)
      },
      slots
    )
  }

  /** 创建字段插槽解析器，优先匹配 `field-name:path` 具名插槽，其次通用 `field-name` 插槽，最后 fieldSlots */
  function createSlotResolver(field: AutoFormField, extraProps?: Record<string, any>) {
    const keyPrefix = field.path
    const fieldSlots = getResolvedFieldSlots(field, extraProps)

    return {
      hasSlot(name: string): boolean {
        const keySpecific = `field-${name}:${keyPrefix}`
        const keyGeneral = `field-${name}`
        return Boolean(
          slots?.[keySpecific]
          || slots?.[keyGeneral]
          || fieldSlots?.[name]
        )
      },

      renderSlot(name: string, slotProps: any) {
        const keySpecific = `field-${name}:${keyPrefix}`
        const keyGeneral = `field-${name}`

        if (slots?.[keySpecific]) {
          return slots[keySpecific](slotProps)
        }

        if (slots?.[keyGeneral]) {
          return slots[keyGeneral](slotProps)
        }

        if (fieldSlots?.[name]) {
          return renderFieldSlot(fieldSlots[name], slotProps)
        }

        return null
      }
    }
  }

  function createSlotProps(field: AutoFormField, extraProps: Record<string, any> = {}): AutoFormFieldContext {
    const context = createFieldContext(field, extraProps)

    return {
      ...extraProps,
      state: context.state,
      path: context.path,
      value: unref(context.value),
      setValue: context.setValue,
      errors: context.errors,
      loading: context.loading
    }
  }

  /** 为 UFormField 包装器生成 label/hint/description/help/error 标准插槽 */
  function createFormFieldSlots(field: AutoFormField, slotResolver: ReturnType<typeof createSlotResolver>, extraProps?: Record<string, any>) {
    const slots: Record<string, any> = {}
    const standardSlots = ['label', 'hint', 'description', 'help', 'error'] as const

    for (const slotName of standardSlots) {
      if (slotResolver.hasSlot(slotName)) {
        slots[slotName] = (slotData: any) => {
          const slotProps = createSlotProps(field, {
            ...extraProps,
            [slotName]: slotData[slotName]
          })
          return slotResolver.renderSlot(slotName, slotProps)
        }
      }
    }

    return slots
  }

  /** 为嵌套/数组字段注入折叠增强逻辑：默认 hint 图标、collapsible 开关、hidden 控制 */
  function createCollapsibleEnhancer(field: AutoFormField, extraProps?: Record<string, any>) {
    const collapsibleConfig = computed(() => resolveFieldProp(field, 'collapsible', undefined, extraProps))

    const shouldShowCollapsible = computed(() => {
      const config = collapsibleConfig.value
      return !config || (config as any).enabled !== false
    })

    const isHidden = computed(() => resolveFieldProp(field, 'hidden', undefined, extraProps))

    const enhancedField = computed<AutoFormField>(() => {
      if (!shouldShowCollapsible.value || field.meta.hint !== undefined) {
        return field
      }

      return defu(field, {
        meta: {
          fieldSlots: {
            hint: (props: { open?: boolean }) => h(UIcon, {
              name: props.open ? 'i-lucide-chevron-down' : 'i-lucide-chevron-right',
              class: 'shrink-0 size-5 transition-transform duration-200'
            })
          }
        }
      } as Partial<AutoFormField>)
    })

    return {
      collapsibleConfig,
      shouldShowCollapsible,
      isHidden,
      enhancedField
    }
  }

  const contextFactory = {
    createFieldContext,
    createSlotProps,
    resolveFieldProp,
    renderFieldSlot,
    getResolvedFieldSlots,
    renderControl,
    createSlotResolver,
    createFormFieldSlots,
    createCollapsibleEnhancer
  }

  provide(AUTO_FORM_CONTEXT_KEY, contextFactory)

  return contextFactory
}

/** 注入表单上下文，必须在 AutoForm 子渲染器中调用 */
export function useAutoFormInjector() {
  const contextFactory = inject(AUTO_FORM_CONTEXT_KEY)

  if (!contextFactory) {
    throw new Error('[AutoForm] useAutoFormInjector must be used within AutoForm component')
  }

  return contextFactory
}
