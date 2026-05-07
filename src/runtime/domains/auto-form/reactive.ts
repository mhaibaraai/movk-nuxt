import type { ReactiveValue, AnyObject } from '@movk/core'
import type { AutoFormFieldContext } from '../../types/auto-form'
import { isFunction, isObject } from '@movk/core'
import { Fragment, h, isRef, isVNode, unref } from 'vue'
import { AUTOFORM_LIMITS, AUTOFORM_PATTERNS } from './constants'

function validateContext(context: AutoFormFieldContext): asserts context is AutoFormFieldContext {
  if (!context || typeof context !== 'object') {
    throw new TypeError('AutoFormFieldContext must be a valid object')
  }
}

function validateReactiveValue(value: unknown): value is ReactiveValue<any, any> {
  return value !== null && value !== undefined
}

/** 解析单个响应式值：函数则以 context 调用，ref 则解包，否则原样返回 */
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

/** 递归解析对象/数组中所有响应式值，VNode 和 ref 不再展开以防止意外渲染 */
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

/** 为 onXxx 事件 prop 自动追加 context 作为最后一个参数，方便用户在事件回调中访问表单状态 */
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

/** 将任意节点规范化为 VNode 数组，过滤 null/false，展开嵌套数组 */
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

/** 渲染任意 VNode 内容（slot 函数返回值、h() 结果等），单子节点直接返回，多个节点包入 Fragment */
export function VNodeRender(props: { node: unknown }) {
  const children = normalize(props.node as any)
  const childCount = children.length

  if (childCount === 0) {
    return null as any
  }

  return h(Fragment, null, children)
}
