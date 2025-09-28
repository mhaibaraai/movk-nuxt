import type { InjectionKey, ModelRef } from 'vue'
import type { AutoFormField, AutoFormFieldContext } from '../types/auto-form'
import defu from 'defu'
import { LRUCache } from 'lru-cache'
import { computed, h, inject, isVNode, provide, resolveDynamicComponent, shallowRef, unref } from 'vue'
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
  clearContextCache: () => void
}

const AUTO_FORM_CONTEXT_KEY: InjectionKey<AutoFormContextFactory> = Symbol('AutoFormContext')

/**
 * 提供字段上下文管理的 composable
 */
export function useAutoFormProvider<T extends Record<string, any>>(
  state: ModelRef<T, string, T, T>,
  slots: Record<string, any>,
) {
  // 使用 LRU 缓存替代无限增长的 Map
  const contextCache = new LRUCache<string, AutoFormFieldContext>({ max: 200 })
  const slotKeyCache = new LRUCache<string, string>({ max: 500 })
  const resolvedPropsCache = new LRUCache<string, any>({ max: 100 })

  // 预编译插槽键计算
  const getSlotKey = (name: string, prefix: string): string => {
    const cacheKey = `${name}|${prefix}`
    let slotKey = slotKeyCache.get(cacheKey)
    if (!slotKey) {
      slotKey = `${name}:${prefix}`
      slotKeyCache.set(cacheKey, slotKey)
    }
    return slotKey
  }

  // 使用浅层响应式和记忆化
  function createFieldContext(field: AutoFormField): AutoFormFieldContext {
    const path = field.path

    // 检查缓存
    const cached = contextCache.get(path)
    if (cached) {
      return cached
    }

    // 使用 shallowRef 替代深度响应式 computed
    const valueRef = shallowRef(getPath(state.value, path))

    // 监听状态变化以更新 shallowRef
    const stopWatcher = computed(() => {
      const newValue = getPath(state.value, path)
      if (valueRef.value !== newValue) {
        valueRef.value = newValue
      }
      return newValue
    })

    const context: AutoFormFieldContext = {
      get state() { return state.value as T },
      path,
      value: valueRef,
      setValue: (v: any) => setPath(state.value, path, v),
      // 添加清理函数
      _cleanup: () => (stopWatcher as any).effect?.stop?.(),
    }

    contextCache.set(path, context)
    return context
  }

  /**
   * 记忆化的值解析
   */
  function resolveValue<T = any>(value: any, field: AutoFormField, defaultValue?: T): T | undefined {
    if (value === undefined)
      return defaultValue

    // 为简单值类型跳过上下文创建
    if (typeof value !== 'function' && typeof value !== 'object') {
      return value
    }

    const cacheKey = `${field.path}_${typeof value}`
    const cached = resolvedPropsCache.get(cacheKey)
    if (cached !== undefined)
      return cached

    const context = createFieldContext(field)
    const result = resolveReactiveValue(value, context)
    resolvedPropsCache.set(cacheKey, result)
    return result
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

  // 控件属性复用对象
  const controlPropsReusableObjects = {
    empty: {},
    disabledOnly: { disabled: true },
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

    const resolvedControlProps = resolveValue(controlMeta.controlProps, field) || controlPropsReusableObjects.empty
    const isReadonly = field.decorators?.isReadonly

    let finalProps: Record<string, any>
    if (isReadonly && Object.keys(resolvedControlProps).length === 0) {
      // 复用预创建的对象
      finalProps = controlPropsReusableObjects.disabledOnly
    }
    else {
      // 优化：使用浅层合并
      finalProps = isReadonly
        ? { ...resolvedControlProps, disabled: true }
        : resolvedControlProps

      // 合并映射属性
      if (controlMeta?.mapped?.controlProps) {
        Object.assign(finalProps, controlMeta.mapped.controlProps)
      }
    }

    const slots = defu(
      resolveValue(controlMeta.controlSlots, field, {}),
      controlMeta?.mapped?.controlSlots,
    )

    // 避免不必要的解构
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

    // 预计算所有可能的插槽键
    const slotKeyMap = new Map<string, string>()
    const standardSlots = ['label', 'hint', 'description', 'help', 'error', 'default']

    for (const slotName of standardSlots) {
      slotKeyMap.set(slotName, getSlotKey(slotName, keyPrefix))
    }

    return {
      /**
       * 使用 Map 查找替代字符串拼接
       */
      hasSlot(name: string): boolean {
        const keySpecific = slotKeyMap.get(name) || getSlotKey(name, keyPrefix)
        return Boolean(
          slots?.[keySpecific]
          || slots?.[name]
          || fieldSlots?.[name],
        )
      },

      /**
       * 渲染指定名称的插槽 - 减少重复的字符串计算
       */
      renderSlot(name: string, slotProps: any) {
        const keySpecific = slotKeyMap.get(name) || getSlotKey(name, keyPrefix)

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

    // 对于空的 extraProps 使用预定义对象
    if (Object.keys(extraProps).length === 0) {
      return {
        state: context.state,
        path: context.path,
        value: unref(context.value),
        setValue: context.setValue,
      }
    }

    return {
      ...extraProps,
      state: context.state,
      path: context.path,
      value: unref(context.value),
      setValue: context.setValue,
    }
  }

  /**
   * 批量创建表单字段插槽
   */
  function createFormFieldSlots(field: AutoFormField, slotResolver: ReturnType<typeof createSlotResolver>, extraProps?: Record<string, any>) {
    const slots: Record<string, any> = {}

    // 预定义标准插槽减少数组创建
    const standardSlots = ['label', 'hint', 'description', 'help', 'error'] as const

    // 批量检查插槽存在性
    const existingSlots = standardSlots.filter(slotName => slotResolver.hasSlot(slotName))

    // 只为存在的插槽创建函数
    for (const slotName of existingSlots) {
      slots[slotName] = (slotData: any) => {
        const slotProps = createSlotProps(field, {
          ...extraProps,
          [slotName]: slotData[slotName],
        })
        return slotResolver.renderSlot(slotName, slotProps)
      }
    }

    return slots
  }

  // 智能缓存清理
  function clearContextCache() {
    // 清理所有上下文的监听器
    contextCache.forEach((context) => {
      if (context._cleanup) {
        context._cleanup()
      }
    })

    contextCache.clear()
    slotKeyCache.clear()
    resolvedPropsCache.clear()
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
    clearContextCache,
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
