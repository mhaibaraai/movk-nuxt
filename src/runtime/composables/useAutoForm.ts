import type { IsComponent } from '../core'
import type { AutoFormControl, AutoFormControls, AutoFormLayoutConfig, TypedZodFactory } from '../types/auto-form'
import { z } from 'zod/v4'
import WithClear from '../components/input/WithClear.vue'
import WithPasswordToggle from '../components/input/WithPasswordToggle.vue'
import WithCopy from '../components/input/WithCopy.vue'
import WithCharacterLimit from '../components/input/WithCharacterLimit.vue'
import DatePicker from '../components/calendar/DatePicker.vue'
import { UInput, UInputNumber, UCheckbox, USwitch, UTextarea } from '#components'
import { isObject } from '@movk/core'
import { AUTOFORM_META } from '../constants/auto-form'

const CLONE_METHODS = [
  'meta', 'optional', 'nullable', 'nullish', 'array', 'promise', 'or', 'and',
  'transform', 'default', 'catch', 'pipe', 'readonly', 'refine', 'describe',
  'brand', 'min', 'max', 'length', 'nonempty', 'email', 'url', 'uuid', 'regex',
  'trim', 'toLowerCase', 'toUpperCase', 'startsWith', 'endsWith', 'includes',
  'datetime', 'ip'
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

      newSchema[AUTOFORM_META.KEY] = newMeta
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
  (schema as any)[AUTOFORM_META.KEY] = meta
  interceptCloneMethods(schema, meta as Record<string, any>)
  return schema
}

/**
 * 从 Zod schema 中提取自定义元数据
 */
function getAutoFormMetadata(schema: z.ZodType): Record<string, any> {
  const meta = (schema as any)[AUTOFORM_META.KEY]
  if (meta)
    return meta

  // 从包装类型中 unwrap 查找元数据 (ZodOptional、ZodNullable、ZodDefault 等)
  if ('unwrap' in schema && typeof (schema as any).unwrap === 'function') {
    try {
      const unwrapped = (schema as any).unwrap()
      return unwrapped?.[AUTOFORM_META.KEY] || {}
    } catch {
      // unwrap 失败，忽略
    }
  }

  return {}
}

/** 基础字段 */
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

    return applyMeta(zodFactory(), controlMeta)
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

// 布局字段
function createLayoutFactory() {
  return <C extends IsComponent = IsComponent>(
    config: AutoFormLayoutConfig<C>
  ) => {
    const schema = z.custom<AutoFormLayoutConfig<C>>()

    return applyMeta(schema, {
      type: AUTOFORM_META.LAYOUT_KEY,
      layout: config
    })
  }
}

export function useAutoForm() {
  function defineControl<C extends IsComponent>(e: AutoFormControl<C>):
  AutoFormControl<C> {
    return e
  }

  const DEFAULT_CONTROL_PROPS = { class: 'w-full' } as const

  const DEFAULT_CONTROLS = {
    // 基础类型
    string: defineControl({ component: UInput, controlProps: DEFAULT_CONTROL_PROPS }),
    number: defineControl({ component: UInputNumber, controlProps: DEFAULT_CONTROL_PROPS }),
    boolean: defineControl({ component: UCheckbox, controlProps: DEFAULT_CONTROL_PROPS }),
    date: defineControl({ component: DatePicker, controlProps: DEFAULT_CONTROL_PROPS }),
    switch: defineControl({ component: USwitch, controlProps: DEFAULT_CONTROL_PROPS }),
    textarea: defineControl({ component: UTextarea, controlProps: DEFAULT_CONTROL_PROPS }),

    // 增强型输入组件
    withClear: defineControl({ component: WithClear, controlProps: DEFAULT_CONTROL_PROPS }),
    withPasswordToggle: defineControl({ component: WithPasswordToggle, controlProps: DEFAULT_CONTROL_PROPS }),
    withCopy: defineControl({ component: WithCopy, controlProps: DEFAULT_CONTROL_PROPS }),
    withCharacterLimit: defineControl({ component: WithCharacterLimit, controlProps: DEFAULT_CONTROL_PROPS })
  } as const satisfies AutoFormControls

  function createZodFactory<TControls extends AutoFormControls = typeof DEFAULT_CONTROLS>(
    _controls?: TControls
  ) {
    return {
      string: createZodFactoryMethod(z.string),
      number: createZodFactoryMethod(z.number),
      boolean: createZodFactoryMethod(z.boolean),
      date: createZodFactoryMethod(z.date),

      array: <T extends z.ZodType>(schema: T, meta?: any) => applyMeta(z.array(schema), meta),

      layout: createLayoutFactory(),

      object: createObjectFactory('object'),
      looseObject: createObjectFactory('looseObject'),
      strictObject: createObjectFactory('strictObject')
    } as unknown as TypedZodFactory<TControls, typeof DEFAULT_CONTROLS>
  }

  const afz = createZodFactory()

  return {
    defineControl,
    afz,
    DEFAULT_CONTROLS,
    getAutoFormMetadata
  }
}
