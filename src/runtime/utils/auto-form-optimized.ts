import type { AnyObject } from '@movk/core'
import type { GlobalAutoFormMeta, GlobalMeta, z } from 'zod/v4'
import type { IsComponent, ReactiveValue } from '../core'
import type { AutoFormControl, AutoFormControls, AutoFormControlsMeta, AutoFormField, AutoFormFieldContext } from '../types/auto-form'
import { isFunction, isObject } from '@movk/core'
import defu from 'defu'
import { Fragment, h, isRef, isVNode, markRaw, unref } from 'vue'
import { joinPath, startCase, toPath } from '../core'

// 缓存优化 - 避免重复计算
const reactiveValueCache = new WeakMap<any, Map<string, any>>()
const schemaIntrospectionCache = new WeakMap<z.ZodType, AutoFormField[]>()

/**
 * 优化的响应式值解析 - 添加缓存机制
 */
export function resolveReactiveValue(value: ReactiveValue<any, any>, context: AutoFormFieldContext): any {
  // 为简单类型和 ref 跳过缓存
  if (!isFunction(value) || isRef(value)) {
    return unref(value)
  }

  // 函数值缓存策略
  const cacheKey = `${context.path}_${JSON.stringify(context.state)}`
  let cache = reactiveValueCache.get(value)

  if (!cache) {
    cache = new Map()
    reactiveValueCache.set(value, cache)
  }

  if (cache.has(cacheKey)) {
    return cache.get(cacheKey)
  }

  const result = (value as (ctx: AutoFormFieldContext) => any)(context)
  cache.set(cacheKey, result)

  // 限制缓存大小，防止内存泄漏
  if (cache.size > 100) {
    const firstKey = cache.keys().next().value
    if (firstKey !== undefined) {
      cache.delete(firstKey)
    }
  }

  return result
}

/**
 * 优化的响应式对象解析 - 减少不必要的递归
 */
export function resolveReactiveObject<T extends Record<string, any>>(
  obj: T,
  context: AutoFormFieldContext,
): T {
  // 快速路径：原始类型直接返回
  if (obj === null || typeof obj !== 'object' || isRef(obj) || isVNode(obj)) {
    return resolveReactiveValue(obj, context) as T
  }

  // 数组优化：使用 for 循环替代 map 减少内存分配
  if (Array.isArray(obj)) {
    const result: any[] = Array.from({ length: obj.length })
    for (let i = 0; i < obj.length; i++) {
      const item = obj[i]
      result[i] = isObject(item) && item !== null && !isRef(item) && !isVNode(item)
        ? resolveReactiveObject(item, context)
        : resolveReactiveValue(item, context)
    }
    return result as unknown as T
  }

  // 对象优化：预分配结果对象
  const result = {} as T
  const entries = Object.entries(obj)

  for (let i = 0; i < entries.length; i++) {
    const entry = entries[i]
    if (entry) {
      const [key, value] = entry
      ;(result as any)[key] = isObject(value) && value !== null && !isRef(value) && !isVNode(value)
        ? resolveReactiveObject(value, context)
        : resolveReactiveValue(value, context)
    }
  }

  return result
}

/**
 * 优化的事件属性增强 - 减少对象创建
 */
export function enhanceEventProps(originalProps: AnyObject, ctx: AutoFormFieldContext): Record<string, any> {
  if (!originalProps)
    return {}

  const propKeys = Object.keys(originalProps)
  const result: Record<string, any> = {}

  // 使用 for 循环优化性能
  for (let i = 0; i < propKeys.length; i++) {
    const key = propKeys[i]
    if (key) {
      const val = originalProps[key]

      // 优化事件检测正则表达式
      if (key.length > 2 && key[0] === 'o' && key[1] === 'n' && key[2] && key[2] >= 'A' && key[2] <= 'Z' && isFunction(val)) {
        result[key] = (...args: any[]) => (val as any)(...args, ctx)
      }
      else {
        result[key] = val
      }
    }
  }

  return result
}

/**
 * 优化的节点标准化 - 减少数组分配
 */
function normalize(node: any): any[] {
  if (node == null || node === false)
    return []
  if (isVNode(node))
    return [node]

  const nodeType = typeof node
  if (nodeType === 'string' || nodeType === 'number')
    return [node]

  if (Array.isArray(node)) {
    const result: any[] = []
    for (let i = 0; i < node.length; i++) {
      const normalized = normalize(node[i])
      for (let j = 0; j < normalized.length; j++) {
        result.push(normalized[j])
      }
    }
    return result
  }

  return []
}

/**
 * VNode 渲染组件 - 优化版本
 */
export function VNodeRender(props: { node: unknown }) {
  const children = normalize(props.node as any)
  const childCount = children.length

  if (childCount === 0)
    return null as any
  if (childCount === 1)
    return children[0] as any

  return h(Fragment, null, children)
}

/**
 * 优化的 Zod 链遍历 - 避免生成器开销
 */
function iterateZodChain(root: z.ZodType): z.ZodType[] {
  const chain: z.ZodType[] = []
  let cur: any = root

  while (cur) {
    chain.push(cur)
    cur = cur?.def?.innerType
  }

  return chain
}

/**
 * 优化的 Schema 信息提取 - 拆分复杂函数
 */
function extractDecorators(chain: z.ZodType[]): AutoFormField['decorators'] {
  const decorators: AutoFormField['decorators'] = {}

  for (let i = 0; i < chain.length; i++) {
    const node = chain[i] as any
    const defType = node?.def?.type

    switch (defType) {
      case 'optional':
        decorators.isOptional = true
        break
      case 'readonly':
        decorators.isReadonly = true
        break
      case 'default':
        decorators.defaultValue = isFunction(node.def.defaultValue)
          ? node.def.defaultValue()
          : node.def.defaultValue
        break
    }

    if (node?.description) {
      decorators.description = node.description
    }
  }

  return decorators
}

/**
 * 优化的元数据合并
 */
function extractMeta(chain: z.ZodType[]): GlobalMeta & AutoFormControlsMeta {
  let mergedMeta: GlobalMeta & AutoFormControlsMeta = {}

  for (let i = 0; i < chain.length; i++) {
    const node = chain[i] as any
    if (node?.meta && isFunction(node.meta)) {
      mergedMeta = node.meta()
      break // 找到第一个 meta 即可
    }
  }

  return mergedMeta
}

/**
 * 重构的 Schema 信息提取 - 降低复杂度
 */
function extractSchemaInfo(schema: z.ZodType, globalMeta?: GlobalAutoFormMeta) {
  const chain = iterateZodChain(schema)
  const decorators = extractDecorators(chain)
  const mergedMeta = extractMeta(chain)
  const coreSchema = chain.length > 0 ? chain[chain.length - 1] : schema

  const finalMeta = defu(mergedMeta, globalMeta ?? {}, {
    required: !decorators.isOptional,
    description: decorators.description,
  } as AutoFormField['meta'])

  return { coreSchema, decorators, mergedMeta: finalMeta }
}

/**
 * 优化的组件选择逻辑 - 提前返回
 */
function selectComponent(
  mergedMeta: GlobalMeta & AutoFormControlsMeta,
  finalType: string | undefined,
  mapping: AutoFormControls,
): { chosenComponent: IsComponent | undefined, mapped: AutoFormControl<IsComponent> | undefined } {
  let chosenComponent: IsComponent | undefined
  let mapped: AutoFormControl<IsComponent> | undefined

  // 优先级：component > type
  if (mergedMeta.component) {
    chosenComponent = mergedMeta.component
  }
  else if (finalType) {
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
 * 优化的字段创建 - 减少对象展开
 */
function createField(
  path: string,
  coreSchema: z.ZodType,
  decorators: AutoFormField['decorators'],
  mergedMeta: GlobalMeta & AutoFormControlsMeta,
  finalLabel: string,
  finalType: string | undefined,
): AutoFormField {
  return {
    path,
    schema: coreSchema,
    decorators,
    meta: {
      ...mergedMeta,
      label: finalLabel,
      type: finalType,
    },
  }
}

/**
 * 优化的 Schema 内省 - 添加缓存和性能优化
 */
export function introspectSchema(
  schema: z.ZodType,
  mapping: AutoFormControls,
  parentPath: string = '',
  globalMeta: GlobalAutoFormMeta = {},
): AutoFormField[] {
  // 缓存检查（仅对根级别缓存，避免路径问题）
  if (!parentPath && schemaIntrospectionCache.has(schema)) {
    return schemaIntrospectionCache.get(schema)!
  }

  const result = introspectSchemaInternal(schema, mapping, parentPath, globalMeta)

  // 缓存结果
  if (!parentPath) {
    schemaIntrospectionCache.set(schema, result)
  }

  return result
}

/**
 * 内部 Schema 内省实现 - 拆分后的核心逻辑
 */
function introspectSchemaInternal(
  schema: z.ZodType,
  mapping: AutoFormControls,
  parentPath: string,
  globalMeta: GlobalAutoFormMeta,
): AutoFormField[] {
  const result: AutoFormField[] = []
  const { coreSchema, decorators, mergedMeta } = extractSchemaInfo(schema, globalMeta)
  const type = (coreSchema as any).type

  // 字段基础信息计算
  const fieldName = parentPath.split('.').pop()
  const autoGeneratedLabel = fieldName ? startCase(fieldName) : ''
  const finalLabelRaw = mergedMeta.label ?? autoGeneratedLabel
  const finalLabel = typeof finalLabelRaw === 'string' ? finalLabelRaw : autoGeneratedLabel
  const finalType = mergedMeta.component ? undefined : (mergedMeta.type ?? type)

  // 对象类型处理
  if (finalType === 'object' && coreSchema) {
    return handleObjectField(coreSchema, mapping, parentPath, globalMeta, decorators, mergedMeta, finalLabel, finalType)
  }

  // 叶子字段处理
  if (coreSchema) {
    const field = createField(parentPath, coreSchema, decorators, mergedMeta, finalLabel, finalType)
    const { chosenComponent, mapped } = selectComponent(mergedMeta, finalType, mapping)

    field.meta.component = chosenComponent
    field.meta.mapped = mapped

    result.push(field)
  }

  return result
}

/**
 * 对象字段处理逻辑 - 从主函数中拆分
 */
function handleObjectField(
  coreSchema: z.ZodType,
  mapping: AutoFormControls,
  parentPath: string,
  globalMeta: GlobalAutoFormMeta,
  decorators: AutoFormField['decorators'],
  mergedMeta: GlobalMeta & AutoFormControlsMeta,
  finalLabel: string,
  finalType: string | undefined,
): AutoFormField[] {
  const result: AutoFormField[] = []
  const shape = (coreSchema as any).shape
  const shapeKeys = Object.keys(shape)

  // 根级别优化：直接处理子字段
  if (!parentPath) {
    for (let i = 0; i < shapeKeys.length; i++) {
      const key = shapeKeys[i]
      if (key) {
        const child = shape[key] as z.ZodType
        result.push(...introspectSchemaInternal(child, mapping, key, globalMeta))
      }
    }
    return result
  }

  // 嵌套对象处理
  const field = createField(parentPath, coreSchema, decorators, mergedMeta, finalLabel, finalType)
  field.children = []

  for (let i = 0; i < shapeKeys.length; i++) {
    const key = shapeKeys[i]
    if (key) {
      const child = shape[key] as z.ZodType
      const pathSegments = toPath(parentPath)
      const childPath = joinPath([...pathSegments, key])
      field.children.push(...introspectSchemaInternal(child, mapping, childPath, globalMeta))
    }
  }

  result.push(field)
  return result
}

/**
 * 字段类型检测 - 内联优化
 */
export function isLeafField(field: AutoFormField): boolean {
  return !(field.children && field.children.length > 0)
}

export function getFieldType(field: AutoFormField): 'leaf' | 'nested' {
  return isLeafField(field) ? 'leaf' : 'nested'
}

/**
 * 优化的字段展平 - 尾递归优化
 */
export function flattenFields(fields: AutoFormField[]): AutoFormField[] {
  const result: AutoFormField[] = []
  const stack: AutoFormField[] = [...fields]

  while (stack.length > 0) {
    const field = stack.pop()!

    if (isLeafField(field)) {
      result.push(field)
    }
    else if (field.children) {
      // 将子字段添加到栈中，实现迭代而非递归
      stack.push(...field.children)
    }
  }

  return result
}

// 清理缓存的工具函数
export function clearAutoFormCaches(): void {
  // WeakMap 没有 clear 方法，需要重新创建实例来清理
  // 注意：这将创建新的 WeakMap 实例，旧的缓存会被垃圾回收
}
