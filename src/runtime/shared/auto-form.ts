import type { DEFAULT_CONTROLS } from '../constants/auto-form'
import type { IsComponent } from '../core'
import type { AutoFormControl, AutoFormControls, AutoFormFactoryMethod } from '../types/auto-form'
import { z } from 'zod/v4'

function applyMeta<T extends z.ZodType, M = unknown>(
  schema: T,
  meta?: M,
): T {
  return meta
    ? (schema.meta(meta as import('zod/v4').GlobalMeta) as T)
    : schema
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

export function createAutoFormZ<TControls extends AutoFormControls = typeof DEFAULT_CONTROLS>(_controls?: TControls) {
  const typedZ = {
    string: (controlMeta?: any) => applyMeta(z.string(), controlMeta),
    number: (controlMeta?: any) => applyMeta(z.number(), controlMeta),
    boolean: (controlMeta?: any) => applyMeta(z.boolean(), controlMeta),
    date: (controlMeta?: any) => applyMeta(z.date(), controlMeta),

    // 直接实现符合接口的 object 函数
    object: ((...args: any[]) => {
      // 如果没有参数，返回柯里化函数
      if (args.length === 0) {
        return (shape: any) => z.object(shape)
      }
      // 如果有参数，直接处理
      return z.object(args[0])
    }) as TypedZodFactory<TControls>['object'],

    looseObject: ((...args: any[]) => {
      if (args.length === 0) {
        return (shape: any) => z.looseObject(shape)
      }
      return z.looseObject(args[0])
    }) as TypedZodFactory<TControls>['looseObject'],

    strictObject: ((...args: any[]) => {
      if (args.length === 0) {
        return (shape: any) => z.strictObject(shape)
      }
      return z.strictObject(args[0])
    }) as TypedZodFactory<TControls>['strictObject'],
  } as unknown as TypedZodFactory<TControls>

  return {
    afz: typedZ,
  }
}

export function createAutoFormControl<T extends IsComponent>(e: AutoFormControl<T>): AutoFormControl<T> {
  return { ...e }
}
