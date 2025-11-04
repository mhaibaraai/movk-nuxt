import type { DEFAULT_CONTROLS } from '../constants/auto-form'
import type { IsComponent } from '../core'
import type { AutoFormControl, AutoFormControls, AutoFormFactoryMethod } from '../types/auto-form'
import { isObject } from '@movk/core'
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
function applyMeta<T extends z.ZodType, M = unknown>(
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
 * 通用的 Zod 工厂方法创建器
 */
function createZodFactoryMethod<T extends z.ZodType>(
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
    // 1. 柯里化写法：afz.object<State>()({...}, meta?) - 类型约束和推断
    <T extends object>(): <S extends Record<string, z.ZodType>>(
      shape: S & Partial<Record<KeysOf<T>, any>>,
      meta?: any
    ) => z.ZodObject<S, z.core.$strip>

    // 2. 直接写法：afz.object({...}, meta?) - 简化语法，保持类型推断
    <S extends Record<string, z.ZodType>>(
      shape: S,
      meta?: any
    ): z.ZodObject<S, z.core.$strip>
  }

  looseObject: {
    <T extends object>(): <S extends Record<string, z.ZodType>>(
      shape: S & Partial<Record<KeysOf<T>, any>>,
      meta?: any
    ) => z.ZodObject<S, z.core.$loose>

    <S extends Record<string, z.ZodType>>(
      shape: S,
      meta?: any
    ): z.ZodObject<S, z.core.$loose>
  }

  strictObject: {
    <T extends object>(): <S extends Record<string, z.ZodType>>(
      shape: S & Partial<Record<KeysOf<T>, any>>,
      meta?: any
    ) => z.ZodObject<S, z.core.$strict>

    <S extends Record<string, z.ZodType>>(
      shape: S,
      meta?: any
    ): z.ZodObject<S, z.core.$strict>
  }
}

/**
 * 对象工厂创建器，支持柯里化和直接调用
 */
function createObjectFactory<T extends 'object' | 'looseObject' | 'strictObject'>(
  method: T
) {
  return ((...args: any[]) => {
    // 柯里化写法: afz.object<State>()({...})
    if (args.length === 0) {
      return (shape: any, meta?: any) => applyMeta((z as any)[method](shape), meta || {})
    }

    // 直接写法: afz.object({...}) 或 afz.object({...}, meta)
    const [shape, meta] = args
    return applyMeta((z as any)[method](shape), meta || {})
  }) as any
}

export function createAutoFormZ<TControls extends AutoFormControls = typeof DEFAULT_CONTROLS>(
  _controls?: TControls
): { afz: TypedZodFactory<TControls> } {
  return {
    afz: {
      string: createZodFactoryMethod(z.string),
      number: createZodFactoryMethod(z.number),
      boolean: createZodFactoryMethod(z.boolean),
      date: createZodFactoryMethod(z.date),

      array: <T extends z.ZodType>(schema: T, meta?: any) => applyMeta(z.array(schema), meta),

      object: createObjectFactory('object'),
      looseObject: createObjectFactory('looseObject'),
      strictObject: createObjectFactory('strictObject')
    } as unknown as TypedZodFactory<TControls>
  }
}

export function createAutoFormControl<C extends IsComponent>(e: AutoFormControl<C>): AutoFormControl<C> {
  return e
}
