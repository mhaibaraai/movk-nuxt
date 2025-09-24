import type { InjectionKey, ModelRef } from 'vue'
import type { AutoFormField, AutoFormFieldContext } from '../types/auto-form'
import defu from 'defu'
import { computed, h, inject, isVNode, provide, resolveDynamicComponent, unref } from 'vue'
import { getPath, setPath } from '../core'
import { enhanceEventProps, resolveReactiveValue } from '../utils/auto-form/rendering'

// 字段上下文工厂类型
interface AutoFormContextFactory {
  createFieldContext: (field: AutoFormField) => AutoFormFieldContext
  slots: Record<string, any> // 插槽引用
  createSlotProps: (field: AutoFormField, extraProps?: Record<string, any>) => AutoFormFieldContext
  resolveFieldProp: <T = any>(field: AutoFormField, prop: string, defaultValue?: T) => T | undefined
  renderFieldSlot: (fn?: (props?: any) => any, slotProps?: any) => any
  getResolvedFieldSlots: (field: AutoFormField) => any
  renderControl: (field: AutoFormField) => any
  createSlotResolver: (field: AutoFormField) => { hasSlot: (name: string) => boolean, renderSlot: (name: string, slotProps: any) => any }
  createFormFieldSlots: (field: AutoFormField, slotResolver: { hasSlot: (name: string) => boolean, renderSlot: (name: string, slotProps: any) => any }) => Record<string, any>
  createAccordionSlots: (field: AutoFormField, defaultImplementations?: Record<string, any>) => Record<string, any>
  clearContextCache: () => void
}

const AUTO_FORM_CONTEXT_KEY: InjectionKey<AutoFormContextFactory> = Symbol('AutoFormContext')

/**
 * 提供字段上下文管理的 composable（用于 AutoForm 组件）
 */
export function useAutoFormProvider<T extends Record<string, any>>(
  state: ModelRef<T, string, T, T>,
  slots: Record<string, any>,
) {
  // 字段上下文缓存 - 按路径缓存已创建的上下文
  const contextCache = new Map<string, AutoFormFieldContext>()

  // 创建字段上下文工厂 - 增加缓存机制提升性能
  function createFieldContext(field: AutoFormField): AutoFormFieldContext {
    const path = field.path

    // 检查缓存
    if (contextCache.has(path)) {
      return contextCache.get(path)!
    }

    // 创建新的上下文
    const context: AutoFormFieldContext = {
      get state() { return state.value as T },
      path,
      value: computed(() => getPath(state.value, path)),
      setValue: (v: any) => setPath(state.value, path, v),
    }

    // 缓存上下文
    contextCache.set(path, context)
    return context
  }

  /**
   * 解析响应式值的统一方法
   */
  function resolveValue<T = any>(value: any, field: AutoFormField, defaultValue?: T): T | undefined {
    if (value === undefined)
      return defaultValue

    const context = createFieldContext(field)
    return resolveReactiveValue(value, context)
  }

  /**
   * 解析字段属性并返回正确类型
   */
  function resolveFieldProp<T = any>(field: AutoFormField, prop: string, defaultValue?: T): T | undefined {
    const value = field.meta?.[prop]
    return resolveValue(value, field, defaultValue)
  }

  /**
   * 渲染字段插槽
   */
  function renderFieldSlot(fn?: (props?: any) => any, slotProps?: any) {
    return fn ? (fn as any)(slotProps) : null
  }

  /**
   * 获取解析后的 fieldSlots
   */
  function getResolvedFieldSlots(field: AutoFormField) {
    if (!field.meta?.fieldSlots)
      return undefined

    return resolveValue(field.meta.fieldSlots, field)
  }

  /**
   * 渲染控件
   */
  function renderControl(field: AutoFormField) {
    const controlMeta = field?.meta
    const comp = controlMeta?.component as any

    // 排除 object
    if (field.meta.type === 'object')
      return null

    if (!comp) {
      return h('div', { class: 'text-red-500' }, `[AutoForm] 控件未映射: ${field?.path ?? ''}`)
    }

    if (isVNode(comp))
      return comp

    const component = typeof comp === 'string' ? resolveDynamicComponent(comp) : comp
    const context = createFieldContext(field)

    // 解析控件属性和插槽
    const props = defu(
      resolveValue(controlMeta.controlProps, field, {}),
      controlMeta?.mapped?.controlProps,
    )
    const slots = defu(
      resolveValue(controlMeta.controlSlots, field, {}),
      controlMeta?.mapped?.controlSlots,
    )

    // 处理 modelValue 更新
    const userOnUpdate = props['onUpdate:modelValue']
    const { 'onUpdate:modelValue': _, ...rest } = props
    const wrapped = enhanceEventProps(rest, context)

    return h(
      component as any,
      {
        ...wrapped,
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
      /**
       * 检查是否存在指定名称的插槽
       */
      hasSlot(name: string): boolean {
        const keySpecific = `${name}:${keyPrefix}`
        return Boolean(
          slots?.[keySpecific]
          || slots?.[name]
          || fieldSlots?.[name],
        )
      },

      /**
       * 渲染指定名称的插槽
       * 优先级：路径特定插槽 > 通用插槽 > 字段级插槽
       */
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
   * 统一处理字段上下文的创建和解引用
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
   * 为 UFormField 生成标准插槽模板
   * 标准化插槽渲染逻辑，减少重复代码
   */
  function createFormFieldSlots(field: AutoFormField, slotResolver: ReturnType<typeof createSlotResolver>) {
    const slots: Record<string, any> = {}

    // 标准插槽名称列表
    const standardSlots = ['label', 'hint', 'description', 'help', 'error'] as const

    standardSlots.forEach((slotName) => {
      if (slotResolver.hasSlot(slotName)) {
        slots[slotName] = (slotData: any) => {
          const slotProps = createSlotProps(field, {
            [slotName]: slotData[slotName],
          })
          return slotResolver.renderSlot(slotName, slotProps)
        }
      }
    })

    return slots
  }

  /**
   * 为 UAccordion 生成类型化插槽配置
   * 提供完整的插槽参数类型支持和默认实现
   */
  function createAccordionSlots(
    field: AutoFormField,
    defaultImplementations: Record<string, any> = {},
  ) {
    const slots: Record<string, any> = {}
    const slotResolver = createSlotResolver(field)

    // accordion 插槽名称映射
    const accordionSlotNames = ['default', 'leading', 'trailing', 'content', 'body'] as const

    accordionSlotNames.forEach((slotName) => {
      // 检查具体插槽和通用插槽
      const specificSlotName = `accordion-${slotName}:${field.path}`
      const globalSlotName = `accordion-${slotName}`

      if (slotResolver.hasSlot(specificSlotName) || slotResolver.hasSlot(globalSlotName)) {
        slots[slotName] = (slotData: any) => {
          // 合并插槽参数，确保类型完整性
          const slotProps = {
            field,
            item: slotData,
            ...slotData,
          }

          // 优先使用具体插槽
          if (slotResolver.hasSlot(specificSlotName)) {
            return slotResolver.renderSlot(specificSlotName, slotProps)
          }
          return slotResolver.renderSlot(globalSlotName, slotProps)
        }
      }
      // 如果有默认实现，使用默认实现
      else if (defaultImplementations[slotName]) {
        slots[slotName] = defaultImplementations[slotName]
      }
    })

    return slots
  }

  // 创建完整的上下文工厂对象
  const contextFactory: AutoFormContextFactory = {
    createFieldContext,
    slots,
    createSlotProps,
    resolveFieldProp,
    renderFieldSlot,
    getResolvedFieldSlots,
    renderControl,
    createSlotResolver,
    createFormFieldSlots,
    createAccordionSlots,
    clearContextCache: () => contextCache.clear(),
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
