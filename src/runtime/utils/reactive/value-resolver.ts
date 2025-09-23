import type { ReactiveValue } from '../../core'
import type { AutoFormFieldContext } from '../../types/auto-form'
import { isFunction, isObject } from '@movk/core'
import { isRef, isVNode, unref } from 'vue'

/**
 * 解析响应式值的统一方法
 * @param value 待解析的值，可以是函数、ref、reactive或普通值
 * @param context 字段上下文
 * @returns 解析后的值
 */
export function resolveReactiveValue(value: ReactiveValue<any, any>, context: AutoFormFieldContext): any {
  if (isFunction(value)) {
    return (value as (ctx: AutoFormFieldContext) => any)(context)
  }
  return unref(value)
}

/**
 * 递归解析响应式对象中的所有值
 * @param obj 待解析的对象或数组
 * @param context 字段上下文
 * @returns 解析后的对象或数组
 */
export function resolveReactiveObject<T extends Record<string, any>>(
  obj: T,
  context: AutoFormFieldContext,
): T {
  // 处理数组
  if (Array.isArray(obj)) {
    return obj.map((item) => {
      if (isObject(item) && item !== null && !isRef(item) && !isVNode(item)) {
        return resolveReactiveObject(item, context)
      }
      return resolveReactiveValue(item, context)
    }) as unknown as T
  }

  // 处理对象
  const result = {} as T
  for (const [key, value] of Object.entries(obj)) {
    if (isObject(value) && value !== null && !isRef(value) && !isVNode(value)) {
      (result as any)[key] = resolveReactiveObject(value, context)
    }
    else {
      (result as any)[key] = resolveReactiveValue(value, context)
    }
  }
  return result
}
