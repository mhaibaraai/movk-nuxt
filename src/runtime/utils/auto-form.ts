import type { AnyObject } from '@movk/core'
import type { GlobalAutoFormMeta } from 'zod/v4'
import type z from 'zod/v4'
import type { IsComponent, ReactiveValue } from '../core'
import type { AutoFormControl, AutoFormControls, AutoFormField, AutoFormFieldContext, AutoFormMergeMeta } from '../types/auto-form'
import { isFunction, isObject } from '@movk/core'
import { Fragment, h, isRef, isVNode, markRaw, unref } from 'vue'
import { joinPath, startCase, toPath } from '../core'
import { getAutoFormMetadata } from '../shared/auto-form'

// 基本限制常量
const MAX_RECURSION_DEPTH = 50
const MAX_ARRAY_LENGTH = 1000
const MAX_OBJECT_PROPERTIES = 100

// 事件属性检测的正则表达式（性能优化）
const EVENT_PROP_REGEX = /^on[A-Z]/

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
  depth: number = 0,
): T {
  validateContext(context)

  // 递归深度保护
  if (depth > MAX_RECURSION_DEPTH) {
    return obj
  }

  // 快速路径：原始类型直接返回
  if (obj === null || typeof obj !== 'object' || isRef(obj) || isVNode(obj)) {
    return resolveReactiveValue(obj, context) as T
  }

  // 数组处理
  if (Array.isArray(obj)) {
    if (obj.length > MAX_ARRAY_LENGTH) {
      return obj
    }

    const result = obj.map(item =>
      isObject(item) && item !== null && !isRef(item) && !isVNode(item)
        ? resolveReactiveObject(item, context, depth + 1)
        : resolveReactiveValue(item, context),
    )
    return result as unknown as T
  }

  // 对象处理
  const entries = Object.entries(obj)
  if (entries.length > MAX_OBJECT_PROPERTIES) {
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
    // 使用正则表达式优化事件属性检测
    if (EVENT_PROP_REGEX.test(key) && isFunction(val)) {
      result[key] = (...args: any[]) => (val as any)(...args, ctx)
    }
    else {
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
  if (depth > MAX_RECURSION_DEPTH) {
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
    if (node.length > MAX_ARRAY_LENGTH) {
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
 * VNode 渲染组件
 */
export function VNodeRender(props: { node: unknown }) {
  const children = normalize(props.node as any)
  const childCount = children.length

  if (childCount === 0) {
    return null as any
  }
  if (childCount === 1) {
    return children[0] as any
  }

  return h(Fragment, null, children)
}

/**
 * 提取 schema 的 decorators 信息
 */
function extractDecorators(schema: z.ZodType): {
  decorators: AutoFormField['decorators']
  coreSchema: z.ZodType
} {
  const decorators: AutoFormField['decorators'] = {}
  let cur: any = schema
  let coreSchema: z.ZodType = schema
  while (cur) {
    const def = cur?.def
    if (!def?.type)
      break
    switch (def.type) {
      case 'optional':
        decorators.isOptional = true
        break
      case 'readonly':
        decorators.isReadonly = true
        break
      case 'default':
        decorators.defaultValue = isFunction(def.defaultValue)
          ? def.defaultValue()
          : def.defaultValue
        break
    }

    if (def.description) {
      decorators.description = def.description
    }

    const next = def?.innerType
    if (!next)
      break

    cur = next
    coreSchema = next
  }

  return { decorators, coreSchema }
}

/**
 * 提取 schema 信息
 */
function extractSchemaInfo(schema: z.ZodType, globalMeta: GlobalAutoFormMeta, autoGeneratedLabel: string) {
  // 1. 获取自定义元数据（已通过方法拦截自动传递到最外层）
  const customMeta = getAutoFormMetadata(schema)

  // 2. 提取 decorators 信息
  const { decorators, coreSchema } = extractDecorators(schema)

  // 3. 获取 Zod 原生元数据
  const zodMeta = coreSchema.meta()

  const mergedMeta = {
    ...{
      required: !decorators.isOptional,
      description: decorators.description,
      label: autoGeneratedLabel,
    } as AutoFormField['meta'],
    ...globalMeta,
    ...zodMeta,
    ...customMeta,
    type: customMeta?.component ? undefined : (customMeta?.type ?? coreSchema?.type),
  } as AutoFormMergeMeta

  return { decorators, mergedMeta, coreSchema }
}

/**
 * 组件选择逻辑
 * @param mergedMeta - 合并后的元数据
 * @param finalType - 最终类型
 * @param mapping - 控件映射
 * @returns 选择的组件和映射信息
 */
function selectComponent(
  mergedMeta: AutoFormMergeMeta,
  finalType: string | undefined,
  mapping: AutoFormControls,
): { chosenComponent: IsComponent | undefined, mapped: AutoFormControl<IsComponent> | undefined } {
  let chosenComponent: IsComponent | undefined
  let mapped: AutoFormControl<IsComponent> | undefined

  // 优先级：component > type
  if (mergedMeta.component) {
    chosenComponent = mergedMeta.component
  }
  else if (finalType && finalType in mapping) {
    mapped = mapping[finalType as keyof typeof mapping]
    chosenComponent = mapped?.component
  }

  // 优化 markRaw 调用
  if (chosenComponent && typeof chosenComponent !== 'string') {
    chosenComponent = markRaw(chosenComponent)
  }

  return { chosenComponent, mapped }
}

/**
 * 字段创建
 */
function createField(
  path: string,
  coreSchema: z.ZodType,
  decorators: AutoFormField['decorators'],
  mergedMeta: AutoFormMergeMeta,
): AutoFormField {
  return {
    path,
    schema: coreSchema,
    decorators,
    meta: mergedMeta,
  }
}

/**
 * 内部 Schema 内省实现
 */
export function introspectSchema(
  schema: z.ZodType,
  mapping: AutoFormControls,
  parentPath: string,
  globalMeta: GlobalAutoFormMeta = {},
): AutoFormField[] {
  const result: AutoFormField[] = []
  // 字段基础信息计算
  const fieldName = parentPath.split('.').pop()
  const autoGeneratedLabel = fieldName ? startCase(fieldName) : ''
  const { decorators, mergedMeta, coreSchema } = extractSchemaInfo(schema, globalMeta, autoGeneratedLabel)
  const finalType = mergedMeta.type
  // 对象类型处理
  if (finalType === 'object' && coreSchema) {
    return handleObjectField(coreSchema, mapping, parentPath, globalMeta, decorators, mergedMeta)
  }

  // 叶子字段处理
  if (coreSchema) {
    const field = createField(parentPath, coreSchema, decorators, mergedMeta)
    const { chosenComponent, mapped } = selectComponent(mergedMeta, finalType, mapping)

    field.meta.component = chosenComponent
    field.meta.mapped = mapped

    result.push(field)
  }

  return result
}

/**
 * 对象字段处理逻辑
 */
function handleObjectField(
  coreSchema: z.ZodType,
  mapping: AutoFormControls,
  parentPath: string,
  globalMeta: GlobalAutoFormMeta,
  decorators: AutoFormField['decorators'],
  mergedMeta: AutoFormMergeMeta,
): AutoFormField[] {
  const result: AutoFormField[] = []
  const shape = (coreSchema as any).shape

  if (!shape || typeof shape !== 'object') {
    return result
  }

  const shapeKeys = Object.keys(shape)

  if (shapeKeys.length > MAX_OBJECT_PROPERTIES) {
    return result
  }

  // 根级别优化：直接处理子字段
  if (!parentPath) {
    for (const key of shapeKeys) {
      if (key in shape) {
        const child = shape[key] as z.ZodType
        result.push(...introspectSchema(child, mapping, key, globalMeta))
      }
    }
    return result
  }

  // 嵌套对象处理
  const field = createField(parentPath, coreSchema, decorators, mergedMeta)
  field.children = []

  for (const key of shapeKeys) {
    if (key in shape) {
      const child = shape[key] as z.ZodType
      const pathSegments = toPath(parentPath)
      const childPath = joinPath([...pathSegments, key])
      field.children.push(...introspectSchema(child, mapping, childPath, globalMeta))
    }
  }

  result.push(field)
  return result
}

/**
 * 优化的字段类型检测 - 增强类型安全
 * @param field - 自动表单字段
 * @returns 是否为叶子字段
 */
export function isLeafField(field: AutoFormField): boolean {
  return !(field?.children && Array.isArray(field.children) && field.children.length > 0)
}

/**
 * 获取字段类型
 * @param field - 自动表单字段
 * @returns 字段类型
 */
export function getFieldType(field: AutoFormField): 'leaf' | 'nested' {
  return isLeafField(field) ? 'leaf' : 'nested'
}
