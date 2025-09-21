import type { AutoFormField } from '../types/auto-form'
import defu from 'defu'
import { h, isVNode, resolveDynamicComponent, unref } from 'vue'
import { enhanceEventProps, resolveReactiveValue } from '../utils/auto-form'
import { useAutoFormInjector } from './useAutoFormContext'

/**
 * 字段渲染器 composable
 */
export function useFieldRenderer() {
  const { createFieldContext } = useAutoFormInjector()

  // 优化：为字段创建共享上下文，避免重复创建
  function createSharedFieldContext(field: AutoFormField) {
    const context = createFieldContext(field)

    return {
      context,
      resolveValue: <T = any>(value: any, defaultValue?: T): T | undefined => {
        if (value === undefined)
          return defaultValue
        return resolveReactiveValue(value, context)
      },
    }
  }

  /**
   * 解析字段属性并返回正确类型
   */
  function resolveFieldProp<T = any>(field: AutoFormField, prop: string, defaultValue?: T): T | undefined {
    const value = field.meta?.[prop]
    if (value === undefined)
      return defaultValue

    const { resolveValue } = createSharedFieldContext(field)
    return resolveValue(value, defaultValue)
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

    const { resolveValue } = createSharedFieldContext(field)
    return resolveValue(field.meta.fieldSlots)
  }

  /**
   * 渲染控件
   */
  function renderControl(field: AutoFormField) {
    const controlMeta = field?.meta
    const comp = controlMeta?.component as any

    if (!comp) {
      return h('div', { class: 'text-red-500' }, `[AutoForm] 控件未映射: ${field?.path ?? ''}`)
    }

    if (isVNode(comp))
      return comp

    const component = typeof comp === 'string' ? resolveDynamicComponent(comp) : comp
    const { context, resolveValue } = createSharedFieldContext(field)

    // 解析控件属性和插槽
    const props = defu(
      resolveValue(controlMeta.controlProps, {}),
      controlMeta?.mapped?.controlProps,
    )
    const slots = defu(
      resolveValue(controlMeta.controlSlots, {}),
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

  return {
    resolveFieldProp,
    renderFieldSlot,
    getResolvedFieldSlots,
    renderControl,
    createFieldContext,
  }
}
