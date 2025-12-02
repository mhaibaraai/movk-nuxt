import type { InjectionKey, Ref } from 'vue'
import type { AutoFormField, AutoFormFieldContext } from '../types/auto-form'
import { UIcon } from '#components'
import defu from 'defu'
import { computed, h, inject, isVNode, provide, resolveDynamicComponent, unref } from 'vue'
import { getPath, setPath } from '@movk/core'
import { enhanceEventProps, resolveReactiveValue } from '../utils/auto-form'

type AutoFormProvider = ReturnType<typeof useAutoFormProvider>

const AUTO_FORM_CONTEXT_KEY: InjectionKey<AutoFormProvider> = Symbol('AUTO_FORM_CONTEXT_KEY')

export function useAutoFormProvider<T extends Record<string, any>>(
  state: Ref<T>,
  slots: Record<string, any>
) {
  // 字段上下文创建
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

          // 如果相对路径以 [ 开头，说明是数组索引，直接拼接
          // 否则，如果当前路径存在且相对路径不为空，用点号连接
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

  /**
   * 解析字段属性
   */
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

  /**
   * 渲染字段插槽
   */
  function renderFieldSlot(fn?: (props?: any) => any, slotProps?: any) {
    return fn ? fn(slotProps) : null
  }

  /**
   * 获取解析后的 fieldSlots
   */
  function getResolvedFieldSlots(field: AutoFormField, extraProps?: Record<string, any>) {
    if (!field.meta?.fieldSlots)
      return undefined
    return resolveFieldProp(field, 'fieldSlots', undefined, extraProps)
  }

  /**
   * 渲染控件
   */
  function renderControl(field: AutoFormField, extraProps?: Record<string, any>) {
    const controlMeta = field?.meta
    const comp = controlMeta?.component as any

    // [object,array] 类型直接返回 null
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
    // 只读处理
    const isReadonly = field.decorators?.isReadonly

    const finalProps = defu(
      resolvedControlProps,
      isReadonly ? { disabled: true } : {},
      controlMeta?.mapped?.controlProps || {}
    )

    const slots = defu(
      resolveFieldProp(field, 'controlSlots', undefined, extraProps) || {},
      controlMeta?.mapped?.controlSlots
    )

    const userOnUpdate = (finalProps as any)['onUpdate:modelValue']
    const wrappedProps = enhanceEventProps(finalProps, context)

    // 移除 onUpdate:modelValue 避免冲突
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

  /**
   * 为字段创建插槽解析器
   */
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

        // 优先级：路径特定 > 通用 > 字段级
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

  /**
   * 创建插槽属性对象
   */
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

  /**
   * 创建表单字段插槽
   */
  function createFormFieldSlots(field: AutoFormField, slotResolver: ReturnType<typeof createSlotResolver>, extraProps?: Record<string, any>) {
    const slots: Record<string, any> = {}
    const standardSlots = ['label', 'hint', 'description', 'help', 'error'] as const

    // 只为存在的插槽创建函数
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

  /**
   * 为数组字段创建折叠功能增强器
   * @param field - 目标字段
   */
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
            hint: ({ open }) => h(UIcon, {
              name: open ? 'i-lucide-chevron-down' : 'i-lucide-chevron-right',
              class: 'shrink-0 size-5 transition-transform duration-200'
            })
          }
        }
      } as AutoFormField)
    })

    return {
      collapsibleConfig,
      shouldShowCollapsible,
      isHidden,
      enhancedField
    }
  }

  // 创建完整的上下文工厂对象
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

  // 通过 provide 机制注入所有方法给子组件
  provide(AUTO_FORM_CONTEXT_KEY, contextFactory)

  return contextFactory
}

export function useAutoFormInjector() {
  const contextFactory = inject(AUTO_FORM_CONTEXT_KEY)

  if (!contextFactory) {
    throw new Error('[AutoForm] useAutoFormInjector must be used within AutoForm component')
  }

  return contextFactory
}
