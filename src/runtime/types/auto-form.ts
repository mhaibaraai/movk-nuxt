import type { DEFAULT_CONTROLS } from '../constants/auto-form'
import type { ComponentProps, ComponentSlots, IsComponent } from '../core'
import type { AutoFormControl, AutoFormControls, FactoryMethod } from './zod.d.ts'
import { z } from 'zod/v4'
import { mergeControls } from '../utils/auto-form'

function applyMeta<T extends z.ZodTypeAny, M = unknown>(
  schema: T,
  meta?: M,
): T {
  return meta ? (schema.meta(meta as unknown as import('zod/v4').GlobalMeta) as T) : schema
}

type ShapeFor<T> = {
  [K in keyof T]?: z.ZodType
}

type StrictShapeFor<T> = {
  [K in keyof T]-?: z.ZodType
} & { [x: string]: never }

type ControlsOf<T extends AutoFormControls> = T & typeof DEFAULT_CONTROLS

interface TypedZodFactory<TControls extends AutoFormControls> {
  // 基础类型（统一使用 FactoryMethod，三段优先级：component > type > zodType）
  string: FactoryMethod<ControlsOf<TControls>, 'string', z.ZodString>
  number: FactoryMethod<ControlsOf<TControls>, 'number', z.ZodNumber>
  boolean: FactoryMethod<ControlsOf<TControls>, 'boolean', z.ZodBoolean>
  date: FactoryMethod<ControlsOf<TControls>, 'date', z.ZodDate>

  // 枚举类型
  enum: FactoryMethod<ControlsOf<TControls>, 'enum', z.ZodEnum<any>, [values: readonly [string, ...string[]]]>

  // 复合类型
  object: FactoryMethod<ControlsOf<TControls>, 'object', z.ZodObject<any>, [shape: z.ZodRawShape]>
  array: FactoryMethod<ControlsOf<TControls>, 'array', z.ZodArray<any>, [schema: z.ZodTypeAny]>
  union: FactoryMethod<ControlsOf<TControls>, 'union', z.ZodUnion<any>, [options: readonly [z.ZodTypeAny, ...z.ZodTypeAny[]]]>
}

export function createAutoFormZ<TControls extends AutoFormControls>(controls?: TControls) {
  const _controls = mergeControls(controls)

  const typedZ: TypedZodFactory<typeof _controls> = {
    // 基础类型
    string: (meta?: any) => applyMeta(z.string(), meta),
    number: (meta?: any) => applyMeta(z.number(), meta),
    boolean: (meta?: any) => applyMeta(z.boolean(), meta),
    date: (meta?: any) => applyMeta(z.date(), meta),

    // 枚举类型
    enum: (values: any, meta?: any) => applyMeta(z.enum(values), meta),

    // 复合类型
    object: (shape: any, meta?: any) => applyMeta(z.object(shape), meta),
    array: (schema: any, meta?: any) => applyMeta(z.array(schema), meta),
    union: (options: any, meta?: any) => applyMeta(z.union(options), meta),
  }

  const objectOf = <T extends object = object>() => {
    return function makeObject(shape: ShapeFor<T>) {
      return z.object(shape as Record<string, z.ZodType>)
    }
  }

  const objectOfStrict = <T extends object = object>() => {
    return function makeObject(shape: StrictShapeFor<T>) {
      return objectOf<T>()(shape as unknown as ShapeFor<T>).strict() as unknown as z.ZodObject<any>
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
