import type { ComponentProps, ComponentSlots, IsComponent } from '../core'
import type { AutoFormControl, AutoFormControls } from './zod.d.ts'
import defu from 'defu'
import { z } from 'zod/v4'
import { DEFAULT_CONTROLS } from '../constants/auto-form'

type ShapeFor<T> = {
  [K in keyof T]?: z.ZodType
}

type StrictShapeFor<T> = {
  [K in keyof T]-?: z.ZodType
} & { [x: string]: never }

// 精简的类型化 Zod 构造器工厂 - 仅保留核心类型
interface TypedZodFactory<_TControls extends AutoFormControls> {
  // 基础类型（6个核心类型）
  string: <TMeta extends import('zod/v4').GlobalMeta>(meta?: TMeta) => z.ZodString
  number: <TMeta extends import('zod/v4').GlobalMeta>(meta?: TMeta) => z.ZodNumber
  boolean: <TMeta extends import('zod/v4').GlobalMeta>(meta?: TMeta) => z.ZodBoolean
  date: <TMeta extends import('zod/v4').GlobalMeta>(meta?: TMeta) => z.ZodDate

  // 枚举类型
  enum: <TMeta extends import('zod/v4').GlobalMeta>(
    values: readonly [string, ...string[]],
    meta?: TMeta
  ) => z.ZodEnum<any>

  // 复合类型（4个核心复合类型）
  object: <T extends z.ZodRawShape, TMeta extends import('zod/v4').GlobalMeta>(
    shape: T,
    meta?: TMeta
  ) => z.ZodObject<T>

  array: <T extends z.ZodTypeAny, TMeta extends import('zod/v4').GlobalMeta>(
    schema: T,
    meta?: TMeta
  ) => z.ZodArray<T>

  union: <T extends readonly [z.ZodTypeAny, ...z.ZodTypeAny[]], TMeta extends import('zod/v4').GlobalMeta>(
    options: T,
    meta?: TMeta
  ) => z.ZodUnion<T>
}

export function createAutoFormZ<TControls extends AutoFormControls>(controls?: TControls) {
  const _controls = defu(controls, DEFAULT_CONTROLS) as TControls & typeof DEFAULT_CONTROLS

  const typedZ: TypedZodFactory<typeof _controls> = {
    // 基础类型
    string: (meta) => {
      const schema = z.string()
      return meta ? schema.meta(meta) : schema
    },

    number: (meta) => {
      const schema = z.number()
      return meta ? schema.meta(meta) : schema
    },

    boolean: (meta) => {
      const schema = z.boolean()
      return meta ? schema.meta(meta) : schema
    },

    date: (meta) => {
      const schema = z.date()
      return meta ? schema.meta(meta) : schema
    },

    // 枚举类型
    enum: (values, meta) => {
      const schema = z.enum(values as any)
      return meta ? schema.meta(meta) : schema
    },

    // 复合类型
    object: (shape, meta) => {
      const schema = z.object(shape)
      return meta ? schema.meta(meta) : schema
    },

    array: (schema, meta) => {
      const arraySchema = z.array(schema)
      return meta ? arraySchema.meta(meta) : arraySchema
    },

    union: (options, meta) => {
      const schema = z.union(options)
      return meta ? schema.meta(meta) : schema
    },
  }

  const objectOf = <T extends object = object>() => {
    return function makeObject(shape: ShapeFor<T>) {
      return z.object(shape as Record<string, z.ZodType>)
    }
  }

  const objectOfStrict = <T extends object = object>() => {
    return function makeObject(shape: StrictShapeFor<T>) {
      return z.object(shape as Record<string, z.ZodType>) as unknown as z.ZodObject<any>
    }
  }

  return {
    objectOf,
    objectOfStrict,
    z: typedZ,
    controls: _controls,
  }
}

export function createControl<T extends IsComponent>(e: {
  component: T
  props?: ComponentProps<T>
  slots?: ComponentSlots<T>
}): AutoFormControl<T> {
  return { component: e.component, props: e.props, slots: e.slots }
}
