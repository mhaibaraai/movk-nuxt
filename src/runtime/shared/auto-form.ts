import type { DEFAULT_CONTROLS } from '../constants/auto-form'
import type { IsComponent } from '../core'
import type { AutoFormControl, AutoFormControls, AutoFormFactoryMethod } from '../types/auto-form'
import { isObject } from '@movk/core'
import { LRUCache } from 'lru-cache'
import { z } from 'zod/v4'

// 特殊标记 Key，用于在 Zod schema 实例上存储自定义元数据
const AUTOFORM_META_KEY = '__autoform_meta__'

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
  'ip',
]

/**
 * 拦截 Zod Schema 的克隆方法，实现元数据自动传递
 *
 * Zod v4 采用不可变设计，每次调用 .meta()、.optional() 等方法都会返回新的 schema 实例。
 * 通过方法拦截，在新实例创建时自动复制元数据，确保链式调用不会丢失元数据。
 *
 * @param schema - 需要拦截的 Zod schema 实例
 * @param customMeta - 要传递的自定义元数据
 * @returns 拦截后的 schema 实例
 */
function interceptCloneMethods<T extends z.ZodType>(schema: T, customMeta: Record<string, any>): T {
  // 为每个克隆方法创建拦截器
  for (const methodName of CLONE_METHODS) {
    const originalMethod = (schema as any)[methodName]
    if (!originalMethod || typeof originalMethod !== 'function') {
      continue
    }

    // 替换原方法
    ; (schema as any)[methodName] = function (...args: any[]) {
      // 调用原始方法获取新 schema
      const newSchema = originalMethod.apply(this, args)

      // 检查返回值是否为有效的 schema 实例
      // meta() 无参数调用时返回元数据对象，不是 schema
      if (!newSchema || typeof newSchema !== 'object' || !('_def' in newSchema)) {
        return newSchema
      }

      // 特殊处理 .meta()：合并新旧元数据
      let newMeta = customMeta
      if (methodName === 'meta' && args.length > 0 && args[0]) {
        newMeta = { ...customMeta, ...args[0] }
      }

      // 将元数据存储到新 schema
      ; (newSchema as any)[AUTOFORM_META_KEY] = newMeta

      // 递归拦截新 schema 的方法
      interceptCloneMethods(newSchema, newMeta)

      return newSchema
    }
  }

  return schema
}

/**
 * 应用元数据到 Zod schema
 *
 * @param schema - Zod schema 实例
 * @param meta - 要应用的元数据
 * @returns 应用元数据后的 schema 实例
 */
function applyMeta<T extends z.ZodType, M = unknown>(
  schema: T,
  meta = {} as M,
): T {
  // 存储元数据到 schema 实例
  (schema as any)[AUTOFORM_META_KEY] = meta
  // 拦截所有会克隆的方法，确保链式调用时元数据不丢失
  interceptCloneMethods(schema, meta as Record<string, any>)

  return schema
}

/**
 * 从 Zod schema 中提取自定义元数据
 *
 * @param schema - Zod schema 实例
 * @returns 元数据对象
 */
export function getAutoFormMetadata(schema: z.ZodType): Record<string, any> {
  // 主要路径：直接读取当前 schema 的元数据
  let meta = (schema as any)[AUTOFORM_META_KEY]

  // 兜底路径：如果当前 schema 没有元数据，尝试从包装类型中 unwrap 查找
  // 适用于 ZodOptional、ZodNullable、ZodDefault 等包装类型
  if (!meta && 'unwrap' in schema && typeof (schema as any).unwrap === 'function') {
    try {
      const unwrapped = (schema as any).unwrap()
      if (unwrapped && typeof unwrapped === 'object') {
        meta = (unwrapped as any)[AUTOFORM_META_KEY]
      }
    }
    catch {
      // unwrap 失败或返回值无效，忽略错误
    }
  }

  return meta || {}
}

/**
 * 通用的 Zod 工厂方法创建器
 * @param zodFactory Zod 构造函数 (z.string, z.number 等)
 * @returns 工厂方法
 */
function createZodFactoryMethod<T extends z.ZodType>(
  zodFactory: (params?: any) => T,
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
type WithDefaultControls<TControls> = TControls & typeof DEFAULT_CONTROLS

interface TypedZodFactory<TC extends AutoFormControls> {
  string: AutoFormFactoryMethod<WithDefaultControls<TC>, 'string', z.ZodString>
  number: AutoFormFactoryMethod<WithDefaultControls<TC>, 'number', z.ZodNumber>
  boolean: AutoFormFactoryMethod<WithDefaultControls<TC>, 'boolean', z.ZodBoolean>
  date: AutoFormFactoryMethod<WithDefaultControls<TC>, 'date', z.ZodDate>

  // 数组工厂方法
  array: <T extends z.ZodType>(schema: T, meta?: any) => z.ZodArray<T>

  // 函数重载：支持两种写法
  object: {
    // 1. 柯里化写法：afz.object<State>()({...}) - 类型约束和推断
    <T extends object>(): <S extends Record<string, z.ZodType>>(
      shape: S & Partial<Record<KeysOf<T>, any>>
    ) => z.ZodObject<S, z.core.$strip>

    // 2. 直接写法：afz.object({...}) - 简化语法，保持类型推断
    <S extends Record<string, z.ZodType>>(
      shape: S
    ): z.ZodObject<S, z.core.$strip>
  }

  looseObject: {
    <T extends object>(): <S extends Record<string, z.ZodType>>(
      shape: S & Partial<Record<KeysOf<T>, any>>
    ) => z.ZodObject<S, z.core.$loose>

    <S extends Record<string, z.ZodType>>(
      shape: S
    ): z.ZodObject<S, z.core.$loose>
  }

  strictObject: {
    <T extends object>(): <S extends Record<string, z.ZodType>>(
      shape: S & Partial<Record<KeysOf<T>, any>>
    ) => z.ZodObject<S, z.core.$strict>

    <S extends Record<string, z.ZodType>>(
      shape: S
    ): z.ZodObject<S, z.core.$strict>
  }
}

/**
 * 通用对象工厂创建器
 */
function createObjectFactory<T extends 'object' | 'looseObject' | 'strictObject'>(
  method: T,
) {
  return ((...args: any[]) => {
    if (args.length === 0) {
      return (shape: any) => (z as any)[method](shape)
    }
    return (z as any)[method](args[0])
  }) as any
}

// 缓存工厂实例，避免重复创建
const autoFormZCache = new LRUCache<string, { afz: TypedZodFactory<any> }>({ max: 100 })

function createCacheKey<T extends AutoFormControls>(controls?: T): string {
  if (!controls)
    return 'default'
  try {
    // 使用排序后的键来确保一致性
    const sortedKeys = Object.keys(controls).sort()
    const sortedControls = sortedKeys.reduce((acc, key) => {
      acc[key] = controls[key]
      return acc
    }, {} as any)
    return JSON.stringify(sortedControls)
  }
  catch {
    // 如果序列化失败，返回唯一标识符
    return `controls_${Date.now()}_${Math.random()}`
  }
}

export function createAutoFormZ<TControls extends AutoFormControls = typeof DEFAULT_CONTROLS>(
  _controls?: TControls,
): { afz: TypedZodFactory<TControls> } {
  const cacheKey = createCacheKey(_controls)

  // 检查缓存
  const cached = autoFormZCache.get(cacheKey)
  if (cached) {
    return cached as { afz: TypedZodFactory<TControls> }
  }

  // 创建新实例
  const typedZ = {
    string: createZodFactoryMethod(z.string),
    number: createZodFactoryMethod(z.number),
    boolean: createZodFactoryMethod(z.boolean),
    date: createZodFactoryMethod(z.date),

    array: <T extends z.ZodType>(schema: T, meta?: any) => applyMeta(z.array(schema), meta),

    object: createObjectFactory('object'),
    looseObject: createObjectFactory('looseObject'),
    strictObject: createObjectFactory('strictObject'),
  } as unknown as TypedZodFactory<TControls>

  const result = { afz: typedZ }

  // 缓存结果
  autoFormZCache.set(cacheKey, result)

  return result
}

export function createAutoFormControl<T extends IsComponent>(e: AutoFormControl<T>): AutoFormControl<T> {
  return { ...e }
}
