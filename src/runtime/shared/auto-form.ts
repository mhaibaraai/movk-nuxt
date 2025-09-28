import type { GlobalMeta } from 'zod/v4'
import type { DEFAULT_CONTROLS } from '../constants/auto-form'
import type { IsComponent } from '../core'
import type { AutoFormControl, AutoFormControls, AutoFormFactoryMethod } from '../types/auto-form'
import { isObject } from '@movk/core'
import { z } from 'zod/v4'

function applyMeta<T extends z.ZodType, M = unknown>(
  schema: T,
  meta?: M,
): T {
  return meta
    ? (schema.meta(meta as GlobalMeta) as T)
    : schema
}

/**
 * 通用的 Zod 工厂方法创建器 - DRY 原则优化
 * @param zodFactory Zod 构造函数 (z.string, z.number 等)
 * @returns 优化后的工厂方法
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
const factoryCache = new WeakMap<any, TypedZodFactory<any>>()

export function createAutoFormZ<TControls extends AutoFormControls = typeof DEFAULT_CONTROLS>(
  _controls?: TControls,
): { afz: TypedZodFactory<TControls> } {
  if (_controls && factoryCache.has(_controls)) {
    return { afz: factoryCache.get(_controls)! }
  }

  const typedZ = {
    string: createZodFactoryMethod(z.string),
    number: createZodFactoryMethod(z.number),
    boolean: createZodFactoryMethod(z.boolean),
    date: createZodFactoryMethod(z.date),

    object: createObjectFactory('object'),
    looseObject: createObjectFactory('looseObject'),
    strictObject: createObjectFactory('strictObject'),
  } as unknown as TypedZodFactory<TControls>

  if (_controls) {
    factoryCache.set(_controls, typedZ)
  }

  return { afz: typedZ }
}

export function createAutoFormControl<T extends IsComponent>(e: AutoFormControl<T>): AutoFormControl<T> {
  return { ...e }
}
