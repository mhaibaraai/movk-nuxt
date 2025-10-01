import type { InjectionKey, ModelRef } from 'vue'
import type { AutoFormField, AutoFormFieldContext } from '../types/auto-form'
import defu from 'defu'
import { h, inject, isVNode, provide, resolveDynamicComponent, unref } from 'vue'
import { getPath, setPath } from '../core'
import { enhanceEventProps, resolveReactiveValue } from '../utils/auto-form'

// 字段上下文工厂类型
interface AutoFormContextFactory {
  createFieldContext: (field: AutoFormField) => AutoFormFieldContext
  createSlotProps: (field: AutoFormField, extraProps?: Record<string, any>) => AutoFormFieldContext
  resolveFieldProp: <T = any>(field: AutoFormField, prop: string, defaultValue?: T) => T | undefined
  renderFieldSlot: (fn?: (props?: any) => any, slotProps?: any) => any
  getResolvedFieldSlots: (field: AutoFormField) => any
  renderControl: (field: AutoFormField) => any
  createSlotResolver: (field: AutoFormField) => { hasSlot: (name: string) => boolean, renderSlot: (name: string, slotProps: any) => any }
  createFormFieldSlots: (field: AutoFormField, slotResolver: { hasSlot: (name: string) => boolean, renderSlot: (name: string, slotProps: any) => any }, extraProps?: Record<string, any>) => Record<string, any>
}

const AUTO_FORM_CONTEXT_KEY: InjectionKey<AutoFormContextFactory> = Symbol('AutoFormContext')

/**
 * 提供字段上下文管理的 composable
 */
export function useAutoFormProvider<T extends Record<string, any>>(
  state: ModelRef<T, string, T, T>,
  slots: Record<string, any>,
) {
  // 字段上下文创建 - 直接创建，不使用缓存
  function createFieldContext(field: AutoFormField): AutoFormFieldContext {
    const path = field.path

    const context: AutoFormFieldContext = {
      get state() { return state.value as T },
      path,
      get value() { return getPath(state.value, path) },
      setValue: (v: any) => {
        setPath(state.value, path, v)
      },
    }

    return context
  }

  /**
   * 解析字段属性
   */
  function resolveFieldProp<T = any>(field: AutoFormField, prop: string, defaultValue?: T): T | undefined {
    const value = field.meta?.[prop]
    if (value === undefined)
      return defaultValue

    const valueType = typeof value
    if (valueType !== 'function' && valueType !== 'object') {
      return value as T
    }

    const context = createFieldContext(field)
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
  function getResolvedFieldSlots(field: AutoFormField) {
    if (!field.meta?.fieldSlots)
      return undefined
    return resolveFieldProp(field, 'fieldSlots')
  }

  /**
   * 渲染控件
   */
  function renderControl(field: AutoFormField) {
    const controlMeta = field?.meta
    const comp = controlMeta?.component as any

    // object 类型直接返回 null
    if (field.meta.type === 'object')
      return null

    if (!comp) {
      return h('div', { class: 'text-red-500' }, `[AutoForm] 控件未映射: ${field?.path ?? ''}`)
    }

    if (isVNode(comp))
      return comp

    const component = typeof comp === 'string' ? resolveDynamicComponent(comp) : comp
    const context = createFieldContext(field)
    const resolvedControlProps = resolveFieldProp(field, 'controlProps') || {}
    // 只读处理
    const isReadonly = field.decorators?.isReadonly

    const finalProps = defu(
      resolvedControlProps,
      isReadonly ? { disabled: true } : {},
      controlMeta?.mapped?.controlProps || {},
    )

    const slots = defu(
      resolveFieldProp(field, 'controlSlots') || {},
      controlMeta?.mapped?.controlSlots,
    )

    const userOnUpdate = finalProps['onUpdate:modelValue']
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
        'modelValue': unref(context.value),
      },
      slots,
    )
  }

  /**
   * 为字段创建插槽解析器
   */
  function createSlotResolver(field: AutoFormField) {
    const keyPrefix = field.path
    const fieldSlots = getResolvedFieldSlots(field)

    return {
      hasSlot(name: string): boolean {
        const keySpecific = `${name}:${keyPrefix}`
        return Boolean(
          slots?.[keySpecific]
          || slots?.[name]
          || fieldSlots?.[name],
        )
      },

      renderSlot(name: string, slotProps: any) {
        const keySpecific = `${name}:${keyPrefix}`

        // 优先级：路径特定 > 通用 > 字段级
        if (slots?.[keySpecific]) {
          return slots[keySpecific](slotProps)
        }

        if (slots?.[name]) {
          return slots[name](slotProps)
        }

        if (fieldSlots?.[name]) {
          return renderFieldSlot(fieldSlots[name], slotProps)
        }

        return null
      },
    }
  }

  /**
   * 创建插槽属性对象
   */
  function createSlotProps(field: AutoFormField, extraProps: Record<string, any> = {}): AutoFormFieldContext {
    const context = createFieldContext(field)

    return {
      ...extraProps,
      state: context.state,
      path: context.path,
      value: unref(context.value),
      setValue: context.setValue,
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
            [slotName]: slotData[slotName],
          })
          return slotResolver.renderSlot(slotName, slotProps)
        }
      }
    }

    return slots
  }

  // 创建完整的上下文工厂对象
  const contextFactory: AutoFormContextFactory = {
    createFieldContext,
    createSlotProps,
    resolveFieldProp,
    renderFieldSlot,
    getResolvedFieldSlots,
    renderControl,
    createSlotResolver,
    createFormFieldSlots,
  }

  // 通过 provide 机制注入所有方法给子组件
  provide(AUTO_FORM_CONTEXT_KEY, contextFactory)

  return contextFactory
}

/**
 * 注入字段上下文管理的 composable（用于子组件）
 */
export function useAutoFormInjector() {
  const contextFactory = inject(AUTO_FORM_CONTEXT_KEY)

  if (!contextFactory) {
    throw new Error('[AutoForm] useAutoFormInjector must be used within AutoForm component')
  }

  return contextFactory
}
