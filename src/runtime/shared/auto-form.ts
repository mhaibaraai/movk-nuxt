import type { DEFAULT_CONTROLS } from '../constants/auto-form'
import type { IsComponent } from '../core'
import type { AutoFormControl, AutoFormControls, AutoFormFactoryMethod } from '../types'
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

interface TypedZodFactory<TControls> {
  string: AutoFormFactoryMethod<TControls, 'string', z.ZodString>
  number: AutoFormFactoryMethod<TControls, 'number', z.ZodNumber>
  boolean: AutoFormFactoryMethod<TControls, 'boolean', z.ZodBoolean>
  date: AutoFormFactoryMethod<TControls, 'date', z.ZodDate>
}

interface ScopedFactory<K> {
  object: <T extends Record<string, z.ZodType>>(shape: T & Partial<Record<KeysOf<K>, unknown>>) => z.ZodObject<T, z.core.$strip>
  looseObject: <T extends Record<string, z.ZodType>>(shape: T & Partial<Record<KeysOf<K>, unknown>>) => z.ZodObject<T, z.core.$loose>
  strictObject: <T extends Record<string, z.ZodType>>(shape: T & Partial<Record<KeysOf<K>, unknown>>) => z.ZodObject<T, z.core.$strict>
  path: (...segs: string[]) => ScopedFactory<any>
}

function createScopedFactory<K>(): ScopedFactory<K> {
  const api = {
    object: (shape: Record<string, z.ZodType>) => z.object(shape),
    looseObject: (shape: Record<string, z.ZodType>) => z.looseObject(shape),
    strictObject: (shape: Record<string, z.ZodType>) => z.strictObject(shape),
    path: (..._segs: string[]) => createScopedFactory<any>(),
  }
  return api as unknown as ScopedFactory<K>
}

export function createAutoFormZ<TControls extends AutoFormControls = typeof DEFAULT_CONTROLS>(_controls?: TControls) {
  const typedZ: TypedZodFactory<TControls & typeof DEFAULT_CONTROLS> = {
    string: (controlMeta?: any) => applyMeta(z.string(), controlMeta),
    number: (controlMeta?: any) => applyMeta(z.number(), controlMeta),
    boolean: (controlMeta?: any) => applyMeta(z.boolean(), controlMeta),
    date: (controlMeta?: any) => applyMeta(z.date(), controlMeta),
  }

  return {
    afz: typedZ,
    scope: <K>() => createScopedFactory<K>(),
  }
}

export function createAutoFormControl<T extends IsComponent>(e: AutoFormControl<T>): AutoFormControl<T> {
  return { ...e }
}
