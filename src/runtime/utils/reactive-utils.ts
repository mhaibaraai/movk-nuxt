import type { AnyObject } from '@movk/core'
import type { ReactiveValue } from '../core'
import type { AutoFormFieldContext } from '../types/auto-form'
import { isFunction, isObject } from '@movk/core'
import { Fragment, h, isRef, isVNode, unref } from 'vue'
import { AUTOFORM_LIMITS, AUTOFORM_PATTERNS } from '../constants/auto-form'

// 输入验证工具
function validateContext(context: AutoFormFieldContext): asserts context is AutoFormFieldContext {
  if (!context || typeof context !== 'object') {
    throw new TypeError('AutoFormFieldContext must be a valid object')
  }
}

function validateReactiveValue(value: unknown): value is ReactiveValue<any, any> {
  return value !== null && value !== undefined
}

/**
 * 响应式值解析
 * @param value - 响应式值
 * @param context - 表单字段上下文
 * @returns 解析后的值
 */
export function resolveReactiveValue(value: ReactiveValue<any, any>, context: AutoFormFieldContext): any {
  validateContext(context)

  if (!validateReactiveValue(value)) {
    return undefined
  }

  if (isFunction(value)) {
    return (value as (ctx: AutoFormFieldContext) => any)(context)
  }

  return unref(value)
}

/**
 * 响应式对象解析
 * @param obj - 要解析的对象
 * @param context - 表单字段上下文
 * @param depth - 当前递归深度（防止无限递归）
 * @returns 解析后的对象
 */
export function resolveReactiveObject<T extends Record<string, any>>(
  obj: T,
  context: AutoFormFieldContext,
  depth: number = 0
): T {
  validateContext(context)

  if (depth > AUTOFORM_LIMITS.MAX_RECURSION_DEPTH) {
    return obj
  }

  if (obj === null || typeof obj !== 'object' || isRef(obj) || isVNode(obj)) {
    return resolveReactiveValue(obj, context) as T
  }

  if (Array.isArray(obj)) {
    if (obj.length > AUTOFORM_LIMITS.MAX_ARRAY_LENGTH) {
      return obj
    }

    const result = obj.map(item =>
      isObject(item) && item !== null && !isRef(item) && !isVNode(item)
        ? resolveReactiveObject(item, context, depth + 1)
        : resolveReactiveValue(item, context)
    )
    return result as unknown as T
  }

  const entries = Object.entries(obj)
  if (entries.length > AUTOFORM_LIMITS.MAX_OBJECT_PROPERTIES) {
    return obj
  }

  const result = {} as T
  for (const [key, value] of entries) {
    ; (result as any)[key] = isObject(value) && value !== null && !isRef(value) && !isVNode(value)
      ? resolveReactiveObject(value, context, depth + 1)
      : resolveReactiveValue(value, context)
  }

  return result
}

/**
 * 增强的事件属性处理 - 提升性能和安全性
 * @param originalProps - 原始属性对象
 * @param ctx - 表单字段上下文
 * @returns 增强后的属性对象
 */
export function enhanceEventProps(originalProps: AnyObject, ctx: AutoFormFieldContext): Record<string, any> {
  if (!originalProps || typeof originalProps !== 'object') {
    return {}
  }

  validateContext(ctx)

  const result: Record<string, any> = {}

  for (const [key, val] of Object.entries(originalProps)) {
    if (AUTOFORM_PATTERNS.EVENT_PROP.test(key) && isFunction(val)) {
      result[key] = (...args: any[]) => (val as any)(...args, ctx)
    } else {
      result[key] = val
    }
  }

  return result
}

/**
 * 节点标准化
 * @param node - 要标准化的节点
 * @param depth - 当前深度
 * @returns 标准化后的节点数组
 */
function normalize(node: any, depth: number = 0): any[] {
  if (depth > AUTOFORM_LIMITS.MAX_RECURSION_DEPTH) {
    return []
  }

  if (node == null || node === false) {
    return []
  }

  if (isVNode(node)) {
    return [node]
  }

  const nodeType = typeof node
  if (nodeType === 'string' || nodeType === 'number') {
    return [node]
  }

  if (Array.isArray(node)) {
    if (node.length > AUTOFORM_LIMITS.MAX_ARRAY_LENGTH) {
      return []
    }

    const result: any[] = []
    for (const item of node) {
      result.push(...normalize(item, depth + 1))
    }
    return result
  }

  return []
}

/**
 * VNode 渲染组件 - 修复水合错误
 */
export function VNodeRender(props: { node: unknown }) {
  const children = normalize(props.node as any)
  const childCount = children.length

  if (childCount === 0) {
    return null as any
  }

  return h(Fragment, null, children)
}
