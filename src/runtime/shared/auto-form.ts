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

  object: <T extends object, S extends Record<string, z.ZodType> = Record<string, z.ZodType>>(shape: S & Partial<Record<KeysOf<T>, unknown>>) => z.ZodObject<S, z.core.$strip>
  looseObject: <T extends object, S extends Record<string, z.ZodType> = Record<string, z.ZodType>>(shape: S & Partial<Record<KeysOf<T>, unknown>>) => z.ZodObject<S, z.core.$loose>
  strictObject: <T extends object, S extends Record<string, z.ZodType> = Record<string, z.ZodType>>(shape: S & Partial<Record<KeysOf<T>, unknown>>) => z.ZodObject<S, z.core.$strict>
}

export function createAutoFormZ<TControls extends AutoFormControls = typeof DEFAULT_CONTROLS>(_controls?: TControls) {
  const typedZ = {
    string: (controlMeta?: any) => applyMeta(z.string(), controlMeta),
    number: (controlMeta?: any) => applyMeta(z.number(), controlMeta),
    boolean: (controlMeta?: any) => applyMeta(z.boolean(), controlMeta),
    date: (controlMeta?: any) => applyMeta(z.date(), controlMeta),

    object: <T extends object, S extends Record<string, z.ZodType>>(shape: S & Partial<Record<KeysOf<T>, unknown>>) => z.object(shape),
    looseObject: <T extends object, S extends Record<string, z.ZodType>>(shape: S & Partial<Record<KeysOf<T>, unknown>>) => z.looseObject(shape),
    strictObject: <T extends object, S extends Record<string, z.ZodType>>(shape: S & Partial<Record<KeysOf<T>, unknown>>) => z.strictObject(shape),

  } as unknown as TypedZodFactory<TControls>

  return {
    afz: typedZ,
  }
}

export function createAutoFormControl<T extends IsComponent>(e: AutoFormControl<T>): AutoFormControl<T> {
  return { ...e }
}
