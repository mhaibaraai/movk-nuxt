import { useAutoForm } from '../composables/useAutoForm'
import type { IsComponent } from '../core'
import type { AutoFormControls, AutoFormFactoryMethod, AutoFormLayoutConfig } from '../types/auto-form'
import { isObject } from '@movk/core'
import { z } from 'zod/v4'

const { DEFAULT_CONTROLS: _DEFAULT_CONTROLS } = useAutoForm()

const AUTOFORM_META_KEY = '__autoform_meta__'
const AUTOFORM_LAYOUT_KEY = '__autoform_layout__'
const AUTOFORM_FIELD_ORDER_KEY = '__autoform_field_order__'

const CLONE_METHODS = [
  'meta', 'optional', 'nullable', 'nullish', 'array', 'promise', 'or', 'and',
  'transform', 'default', 'catch', 'pipe', 'readonly', 'refine', 'describe',
  'brand', 'min', 'max', 'length', 'nonempty', 'email', 'url', 'uuid', 'regex',
  'trim', 'toLowerCase', 'toUpperCase', 'startsWith', 'endsWith', 'includes',
  'datetime', 'ip'
]

/**
 * 拦截 Zod 克隆方法以传递元数据和布局配置
 * Zod v4 不可变设计要求方法拦截确保链式调用时数据不丢失
 */
function interceptCloneMethods<T extends z.ZodType>(
  schema: T,
  customMeta: Record<string, any>,
  layoutConfig?: AutoFormLayoutConfig[],
  fieldOrder?: Array<{ key: string, type: 'layout' | 'field', layoutIndex?: number }>
): T {
  for (const methodName of CLONE_METHODS) {
    const originalMethod = (schema as any)[methodName]
    if (typeof originalMethod !== 'function')
      continue

    (schema as any)[methodName] = function (...args: any[]) {
      const newSchema = originalMethod.apply(this, args)

      if (!newSchema?._def)
        return newSchema

      const newMeta = methodName === 'meta' && args[0]
        ? { ...customMeta, ...args[0] }
        : customMeta

      newSchema[AUTOFORM_META_KEY] = newMeta

      if (layoutConfig) {
        newSchema[AUTOFORM_LAYOUT_KEY] = layoutConfig
      }

      if (fieldOrder) {
        newSchema[AUTOFORM_FIELD_ORDER_KEY] = fieldOrder
      }

      return interceptCloneMethods(newSchema, newMeta, layoutConfig, fieldOrder)
    }
  }

  return schema
}

function applyMeta<T extends z.ZodType, M = unknown>(
  schema: T,
  meta = {} as M,
  layoutConfig?: AutoFormLayoutConfig[],
  fieldOrder?: Array<{ key: string, type: 'layout' | 'field', layoutIndex?: number }>
): T {
  (schema as any)[AUTOFORM_META_KEY] = meta
  if (layoutConfig) {
    (schema as any)[AUTOFORM_LAYOUT_KEY] = layoutConfig
  }
  if (fieldOrder) {
    (schema as any)[AUTOFORM_FIELD_ORDER_KEY] = fieldOrder
  }
  interceptCloneMethods(schema, meta as Record<string, any>, layoutConfig, fieldOrder)
  return schema
}

export function getAutoFormMetadata(schema: z.ZodType): Record<string, any> {
  const meta = (schema as any)[AUTOFORM_META_KEY]
  if (meta)
    return meta

  if ('unwrap' in schema && typeof (schema as any).unwrap === 'function') {
    try {
      const unwrapped = (schema as any).unwrap()
      return unwrapped?.[AUTOFORM_META_KEY] || {}
    } catch {
      // ignore unwrap errors
    }
  }

  return {}
}

export function getAutoFormLayout(schema: z.ZodType): AutoFormLayoutConfig[] | undefined {
  const layouts = (schema as any)[AUTOFORM_LAYOUT_KEY]
  return Array.isArray(layouts) && layouts.length > 0 ? layouts : undefined
}

export function getAutoFormFieldOrder(schema: z.ZodType): Array<{ key: string, type: 'layout' | 'field', layoutIndex?: number }> | undefined {
  const fieldOrder = (schema as any)[AUTOFORM_FIELD_ORDER_KEY]
  return Array.isArray(fieldOrder) && fieldOrder.length > 0 ? fieldOrder : undefined
}

function createZodFactoryMethod<T extends z.ZodType>(
  zodFactory: (params?: any) => T
) {
  return (controlMeta?: any): T => {
    if (typeof controlMeta === 'string') {
      return zodFactory(controlMeta)
    }

    if (controlMeta && isObject(controlMeta) && 'error' in controlMeta) {
      const { error, ...meta } = controlMeta
      return applyMeta(zodFactory(error), meta)
    }

    return applyMeta(zodFactory(), controlMeta)
  }
}

type KeysOf<T> = Extract<keyof T, string>
type WithDefaultControls<TControls> = TControls & typeof _DEFAULT_CONTROLS

interface LayoutFieldMarker<Fields extends Record<string, z.ZodType>> {
  __brand: 'LayoutMarker'
  class?: string
  component?: any
  props?: any
  slots?: any
  fields: Fields
}

/**
 * 类型体操: 过滤布局标记并展开其 fields
 *
 * 1. 移除所有 LayoutFieldMarker 类型的键
 * 2. 合并所有布局的 fields
 */
type FilterLayoutMarkers<S extends Record<string, any>> = {
  [K in keyof S as S[K] extends LayoutFieldMarker<any> ? never : K]: S[K]
}

type UnionToIntersection<U> = (U extends any ? (k: U) => void : never) extends ((k: infer I) => void) ? I : never

type ExtractAllLayoutFields<S extends Record<string, any>> = UnionToIntersection<
  {
    [K in keyof S]: S[K] extends LayoutFieldMarker<infer Fields> ? Fields : {}
  }[keyof S]
>

type ExtractLayoutShape<S extends Record<string, any>>
  = FilterLayoutMarkers<S> & ExtractAllLayoutFields<S>

interface TypedZodFactory<TC extends AutoFormControls> {
  string: AutoFormFactoryMethod<WithDefaultControls<TC>, 'string', z.ZodString>
  number: AutoFormFactoryMethod<WithDefaultControls<TC>, 'number', z.ZodNumber>
  boolean: AutoFormFactoryMethod<WithDefaultControls<TC>, 'boolean', z.ZodBoolean>
  date: AutoFormFactoryMethod<WithDefaultControls<TC>, 'date', z.ZodDate>

  array: <T extends z.ZodType>(schema: T, meta?: any) => z.ZodArray<T>

  layout: <C extends IsComponent = IsComponent, Fields extends Record<string, z.ZodType> = Record<string, z.ZodType>>(
    config: Omit<AutoFormLayoutConfig<C>, 'fields'> & { fields: Fields }
  ) => LayoutFieldMarker<Fields>

  object: {
    <T extends object>(): <S extends Record<string, any>>(
      shape: S & Partial<Record<KeysOf<T>, any>>,
      meta?: any
    ) => z.ZodObject<ExtractLayoutShape<S>, z.core.$strip>

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

function createObjectFactory<T extends 'object' | 'looseObject' | 'strictObject'>(
  method: T
) {
  return ((...args: any[]) => {
    if (args.length === 0) {
      return (shape: any, meta?: any) => {
        const processedShape = processLayoutShape(shape)
        return applyMeta(
          (z as any)[method](processedShape.shape),
          meta || {},
          processedShape.layouts.length > 0 ? processedShape.layouts : undefined,
          processedShape.fieldOrder.length > 0 ? processedShape.fieldOrder : undefined
        )
      }
    }

    const [shape, meta] = args
    const processedShape = processLayoutShape(shape)
    return applyMeta(
      (z as any)[method](processedShape.shape),
      meta || {},
      processedShape.layouts.length > 0 ? processedShape.layouts : undefined,
      processedShape.fieldOrder.length > 0 ? processedShape.fieldOrder : undefined
    )
  }) as any
}

/**
 * 检测值是否为布局标记
 */
function isLayoutMarker(value: any): value is LayoutFieldMarker<any> {
  return value && typeof value === 'object' && '__brand' in value && value.__brand === 'LayoutMarker'
}

/**
 * 处理布局标记: 收集布局配置，展开布局字段到 shape
 *
 * 策略：
 * 1. 遍历 shape，检测布局标记（通过 __brand 识别）
 * 2. 收集布局配置和字段顺序信息
 * 3. 展开布局字段到 shape（供 Zod 验证）
 * 4. 移除布局标记本身（不是数据字段）
 * 5. 保留非布局普通字段
 */
function processLayoutShape(shape: Record<string, any>): {
  shape: Record<string, z.ZodType>
  layouts: Array<AutoFormLayoutConfig & { __originalKey: string }>
  fieldOrder: Array<{ key: string, type: 'layout' | 'field', layoutIndex?: number }>
} {
  if (!shape || typeof shape !== 'object') {
    return { shape, layouts: [], fieldOrder: [] }
  }

  const layouts: Array<AutoFormLayoutConfig & { __originalKey: string }> = []
  const resultShape: Record<string, z.ZodType> = {}
  const fieldOrder: Array<{ key: string, type: 'layout' | 'field', layoutIndex?: number }> = []

  // 遍历原始 shape，记录顺序
  for (const [key, value] of Object.entries(shape)) {
    if (isLayoutMarker(value)) {
      // 这是布局标记：收集配置，展开字段
      const layoutIndex = layouts.length
      const layoutConfig: AutoFormLayoutConfig & { __originalKey: string } = {
        class: value.class,
        component: value.component,
        props: value.props,
        slots: value.slots,
        fields: value.fields,
        __originalKey: key
      }
      layouts.push(layoutConfig)

      // 记录布局标记的位置
      fieldOrder.push({ key, type: 'layout', layoutIndex })

      // 展开布局中的字段到 resultShape
      for (const [fieldKey, fieldSchema] of Object.entries(value.fields)) {
        if (!resultShape[fieldKey]) {
          resultShape[fieldKey] = fieldSchema as z.ZodType
        }
      }
    } else {
      // 这是普通字段：直接添加并记录位置
      resultShape[key] = value
      fieldOrder.push({ key, type: 'field' })
    }
  }

  return { shape: resultShape, layouts, fieldOrder }
}

/**
 * 布局标记工厂: 创建 $layout 配置，配合 afz.object({ $layout: afz.layout(...) })
 */
function createLayoutFactory() {
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
