import { useAutoForm } from '../composables/useAutoForm'
import type { IsComponent } from '../core'
import type { AutoFormControls, AutoFormFactoryMethod, AutoFormLayoutConfig } from '../types/auto-form'
import { isObject } from '@movk/core'
import { z } from 'zod/v4'

const { DEFAULT_CONTROLS: _DEFAULT_CONTROLS } = useAutoForm()

// 特殊标记 Key，用于在 Zod schema 实例上存储自定义元数据
const AUTOFORM_META_KEY = '__autoform_meta__'
// 布局配置标记 Key
const AUTOFORM_LAYOUT_KEY = '__autoform_layout__'
// 布局来源标记 Key - 用于追踪字段属于哪个布局组
const LAYOUT_SOURCE_KEY = '__layout_source__'

/**
 * 需要拦截的 Zod 方法列表
 * 这些方法会返回新的 schema 实例，需要自动传递元数据
 */
const CLONE_METHODS = [
  'meta',
  'optional',
  'nullable',
  'nullish',
  'array',
  'promise',
  'or',
  'and',
  'transform',
  'default',
  'catch',
  'pipe',
  'readonly',
  'refine',
  'describe',
  'brand',
  'min',
  'max',
  'length',
  'nonempty',
  'email',
  'url',
  'uuid',
  'regex',
  'trim',
  'toLowerCase',
  'toUpperCase',
  'startsWith',
  'endsWith',
  'includes',
  'datetime',
  'ip'
]

/**
 * 拦截 Zod Schema 的克隆方法，实现元数据自动传递
 * Zod v4 不可变设计，通过方法拦截确保链式调用时元数据不丢失
 */
function interceptCloneMethods<T extends z.ZodType>(schema: T, customMeta: Record<string, any>): T {
  for (const methodName of CLONE_METHODS) {
    const originalMethod = (schema as any)[methodName]
    if (typeof originalMethod !== 'function')
      continue

    (schema as any)[methodName] = function (...args: any[]) {
      const newSchema = originalMethod.apply(this, args)

      // meta() 无参数调用返回元数据对象，不是 schema
      if (!newSchema?._def)
        return newSchema

      // .meta() 方法合并新旧元数据
      const newMeta = methodName === 'meta' && args[0]
        ? { ...customMeta, ...args[0] }
        : customMeta

      newSchema[AUTOFORM_META_KEY] = newMeta
      return interceptCloneMethods(newSchema, newMeta)
    }
  }

  return schema
}

/**
 * 应用元数据到 Zod schema
 */
export function applyMeta<T extends z.ZodType, M = unknown>(
  schema: T,
  meta = {} as M
): T {
  (schema as any)[AUTOFORM_META_KEY] = meta
  interceptCloneMethods(schema, meta as Record<string, any>)
  return schema
}

/**
 * 从 Zod schema 中提取自定义元数据
 */
export function getAutoFormMetadata(schema: z.ZodType): Record<string, any> {
  const meta = (schema as any)[AUTOFORM_META_KEY]
  if (meta)
    return meta

  // 从包装类型中 unwrap 查找元数据 (ZodOptional、ZodNullable、ZodDefault 等)
  if ('unwrap' in schema && typeof (schema as any).unwrap === 'function') {
    try {
      const unwrapped = (schema as any).unwrap()
      return unwrapped?.[AUTOFORM_META_KEY] || {}
    } catch {
      // unwrap 失败，忽略
    }
  }

  return {}
}

/**
 * 从 Zod schema 中提取布局配置
 */
export function getAutoFormLayout(schema: z.ZodType): AutoFormLayoutConfig | undefined {
  return (schema as any)[AUTOFORM_LAYOUT_KEY]
}

/**
 * 通用的 Zod 工厂方法创建器
 */
export function createZodFactoryMethod<T extends z.ZodType>(
  zodFactory: (params?: any) => T
) {
  return (controlMeta?: any): T => {
    // 字符串直接作为错误消息
    if (typeof controlMeta === 'string') {
      return zodFactory(controlMeta)
    }

    // 对象且包含 error 属性
    if (controlMeta && isObject(controlMeta) && 'error' in controlMeta) {
      const { error, ...meta } = controlMeta
      return applyMeta(zodFactory(error), meta)
    }

    // 正常处理
    return applyMeta(zodFactory(), controlMeta)
  }
}

type KeysOf<T> = Extract<keyof T, string>
type WithDefaultControls<TControls> = TControls & typeof _DEFAULT_CONTROLS

/**
 * 布局字段标记类型
 */
interface LayoutFieldMarker<Fields extends Record<string, z.ZodType>> {
  __brand: 'LayoutMarker'
  class?: string
  component?: any
  props?: any
  slots?: any
  fields: Fields
}

/**
 * 提取布局字段 - 类型体操
 * 如果 shape 中有 $layout 字段,展开其 fields 并排除 $layout
 */
type ExtractLayoutShape<S extends Record<string, any>> = S extends {
  $layout: LayoutFieldMarker<infer Fields>
}
  ? Omit<S, '$layout'> & Fields
  : S

export interface TypedZodFactory<TC extends AutoFormControls> {
  string: AutoFormFactoryMethod<WithDefaultControls<TC>, 'string', z.ZodString>
  number: AutoFormFactoryMethod<WithDefaultControls<TC>, 'number', z.ZodNumber>
  boolean: AutoFormFactoryMethod<WithDefaultControls<TC>, 'boolean', z.ZodBoolean>
  date: AutoFormFactoryMethod<WithDefaultControls<TC>, 'date', z.ZodDate>

  // 数组工厂方法
  array: <T extends z.ZodType>(schema: T, meta?: any) => z.ZodArray<T>

  // 布局标记方法 - 返回布局字段标记,配合 afz.object({ $layout: ... }) 使用
  layout: <C extends IsComponent = IsComponent, Fields extends Record<string, z.ZodType> = Record<string, z.ZodType>>(
    config: Omit<AutoFormLayoutConfig<C>, 'fields'> & { fields: Fields }
  ) => LayoutFieldMarker<Fields>

  // 函数重载：支持两种写法,自动处理 $layout 字段
  object: {
    // 1. 柯里化写法：afz.object<State>()({...}, meta?) - 类型约束和推断
    <T extends object>(): <S extends Record<string, any>>(
      shape: S & Partial<Record<KeysOf<T>, any>>,
      meta?: any
    ) => z.ZodObject<ExtractLayoutShape<S>, z.core.$strip>

    // 2. 直接写法：afz.object({...}, meta?) - 简化语法，保持类型推断
    <S extends Record<string, any>>(
      shape: S,
      meta?: any
    ): z.ZodObject<ExtractLayoutShape<S>, z.core.$strip>
  }

  looseObject: {
    <T extends object>(): <S extends Record<string, any>>(
      shape: S & Partial<Record<KeysOf<T>, any>>,
      meta?: any
    ) => z.ZodObject<ExtractLayoutShape<S>, z.core.$loose>

    <S extends Record<string, any>>(
      shape: S,
      meta?: any
    ): z.ZodObject<ExtractLayoutShape<S>, z.core.$loose>
  }

  strictObject: {
    <T extends object>(): <S extends Record<string, any>>(
      shape: S & Partial<Record<KeysOf<T>, any>>,
      meta?: any
    ) => z.ZodObject<ExtractLayoutShape<S>, z.core.$strict>

    <S extends Record<string, any>>(
      shape: S,
      meta?: any
    ): z.ZodObject<ExtractLayoutShape<S>, z.core.$strict>
  }
}

/**
 * 对象工厂创建器,支持柯里化和直接调用
 * 自动处理 $layout 字段的展开
 */
export function createObjectFactory<T extends 'object' | 'looseObject' | 'strictObject'>(
  method: T
) {
  return ((...args: any[]) => {
    // 柯里化写法: afz.object<State>()({...})
    if (args.length === 0) {
      return (shape: any, meta?: any) => {
        const processedShape = processLayoutShape(shape)
        return applyMeta((z as any)[method](processedShape.shape), meta || {})
      }
    }

    // 直接写法: afz.object({...}) 或 afz.object({...}, meta)
    const [shape, meta] = args
    const processedShape = processLayoutShape(shape)
    return applyMeta((z as any)[method](processedShape.shape), meta || {})
  }) as any
}

/**
 * 处理包含 $layout 的 shape
 * 展开 $layout.fields 到顶层,并保存布局配置
 */
function processLayoutShape(shape: Record<string, any>): {
  shape: Record<string, z.ZodType>
  layouts: AutoFormLayoutConfig[]
} {
  if (!shape || typeof shape !== 'object') {
    return { shape, layouts: [] }
  }

  const layouts: AutoFormLayoutConfig[] = []
  const resultShape: Record<string, z.ZodType> = {}

  for (const [key, value] of Object.entries(shape)) {
    if (key === '$layout' && value && typeof value === 'object' && '__brand' in value) {
      // 这是一个布局标记
      const layoutMarker = value as LayoutFieldMarker<any>
      const layoutConfig: AutoFormLayoutConfig = {
        class: layoutMarker.class,
        component: layoutMarker.component,
        props: layoutMarker.props,
        slots: layoutMarker.slots,
        fields: layoutMarker.fields
      }
      layouts.push(layoutConfig)

      // 展开 fields 到顶层
      for (const [fieldKey, fieldSchema] of Object.entries(layoutMarker.fields)) {
        resultShape[fieldKey] = fieldSchema as z.ZodType
        // 标记字段来源
        const layoutId = `layout_${layouts.length}`
        ; (fieldSchema as any)[LAYOUT_SOURCE_KEY] = {
          id: layoutId,
          config: layoutConfig
        }
      }
    } else {
      // 普通字段
      resultShape[key] = value
    }
  }

  return { shape: resultShape, layouts }
}

/**
 * 布局标记工厂 - 创建布局字段标记
 * 用于 afz.object({ $layout: afz.layout({...}) })
 */
export function createLayoutFactory() {
  return <C extends IsComponent = IsComponent, Fields extends Record<string, z.ZodType> = Record<string, z.ZodType>>(
    config: Omit<AutoFormLayoutConfig<C>, 'fields'> & { fields: Fields }
  ): LayoutFieldMarker<Fields> => {
    return {
      __brand: 'LayoutMarker',
      class: config.class as any,
      component: config.component,
      props: config.props,
      slots: config.slots,
      fields: config.fields
    }
  }
}

/**
 * 获取字段的布局来源
 */
export function getFieldLayoutSource(field: z.ZodType): { id: string, config: AutoFormLayoutConfig } | undefined {
  return (field as any)[LAYOUT_SOURCE_KEY]
}
