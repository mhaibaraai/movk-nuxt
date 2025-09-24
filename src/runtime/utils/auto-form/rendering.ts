import type { AnyObject } from '@movk/core'
import type { ReactiveValue } from '../../core'
import type { AutoFormAccordionItem, AutoFormAccordionProps, AutoFormField, AutoFormFieldContext } from '../../types/auto-form'
import { isFunction, isObject } from '@movk/core'
import { Fragment, h, isRef, isVNode, unref } from 'vue'

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

/**
 * 增强事件属性函数 - 为Vue组件的事件处理函数注入表单字段上下文
 * @param originalProps 原始属性对象
 * @param ctx 字段上下文
 * @returns 增强后的属性对象
 */
export function enhanceEventProps(originalProps: AnyObject, ctx: AutoFormFieldContext) {
  const next: Record<string, any> = {}
  for (const key of Object.keys(originalProps || {})) {
    const val = (originalProps as any)[key]
    if (/^on[A-Z].+/.test(key) && isFunction(val)) {
      next[key] = (...args: any[]) => (val as any)(...args, ctx)
    }
    else {
      next[key] = val
    }
  }
  return next
}

/**
 * 标准化节点值，确保返回可渲染的 VNode 数组
 * @param node 待标准化的节点
 * @returns 标准化后的 VNode 数组
 */
function normalize(node: any): any[] {
  if (node == null || node === false)
    return []

  if (Array.isArray(node))
    return node.flatMap(n => normalize(n))

  if (isVNode(node))
    return [node]

  const t = typeof node
  if (t === 'string' || t === 'number')
    return [node]

  // 其它对象不参与字符串化，避免触发 JSON.stringify 循环
  return []
}

/**
 * VNode 渲染组件
 * 用于渲染动态内容，自动处理节点标准化
 * @param props 包含 node 属性的 props 对象
 * @param props.node 待渲染的节点
 * @returns 渲染结果
 */
export function VNodeRender(props: { node: unknown }) {
  const children = normalize(props.node as any)
  if (children.length === 0)
    return null as any
  if (children.length === 1)
    return children[0] as any
  return h(Fragment, null, children)
}

/**
 * 检测字段是否为对象字段（容器字段）
 * @param field 字段
 * @returns 是否为对象字段
 */
function isObjectField(field: AutoFormField): boolean {
  return !!(field.children && field.children.length > 0)
}

/**
 * 检测字段是否为叶子节点字段（有控件的字段）
 * @param field 字段
 * @returns 是否为叶子节点字段
 */
export function isLeafField(field: AutoFormField): boolean {
  return !isObjectField(field)
}

// 判断子字段类型的辅助函数
export function getFieldType(field: AutoFormField): 'leaf' | 'nested' {
  return isLeafField(field) ? 'leaf' : 'nested'
}

/**
 * 递归展平字段列表，只返回叶子节点字段
 * @param fields 字段列表
 * @returns 展平后的叶子节点字段列表
 */
export function flattenFields(fields: AutoFormField[]): AutoFormField[] {
  const result: AutoFormField[] = []

  for (const field of fields) {
    if (isLeafField(field)) {
      // 叶子节点直接添加
      result.push(field)
    }
    else if (field.children) {
      // 对象字段递归展平其子字段
      result.push(...flattenFields(field.children))
    }
  }

  return result
}

/**
 * 生成 UAccordion 的 item 配置
 * @param objectField 对象字段
 * @param config Accordion 配置
 * @returns AutoFormAccordionItem，包含字段信息
 */
export function generateAccordionItems(
  objectField: AutoFormField,
  config?: AutoFormAccordionProps,
): AutoFormAccordionItem {
  // 使用自定义生成器（如果提供）
  if (config?.itemGenerator) {
    const customItem = config.itemGenerator(objectField)
    // 确保包含 field 信息
    return { ...customItem, field: objectField } as AutoFormAccordionItem
  }

  // 默认生成逻辑 - 包含 field 信息
  const defaultItem: AutoFormAccordionItem = {
    slot: `content-${objectField.path}`,
    field: objectField, // 注入字段信息
  }

  return defaultItem
}
