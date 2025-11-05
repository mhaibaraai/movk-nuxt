import type { IsComponent } from '../core'
import type { AutoFormControl, AutoFormControls, AutoFormLayoutConfig } from '../types/auto-form'
import { z } from 'zod/v4'
import WithClear from '../components/input/WithClear.vue'
import WithPasswordToggle from '../components/input/WithPasswordToggle.vue'
import WithCopy from '../components/input/WithCopy.vue'
import WithCharacterLimit from '../components/input/WithCharacterLimit.vue'
import DatePicker from '../components/calendar/DatePicker.vue'
import { UInput, UInputNumber, UCheckbox, USwitch, UTextarea } from '#components'
import { isObject } from '@movk/core'

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

function isLayoutMarker(value: any): value is LayoutFieldMarker<any> {
  return value && typeof value === 'object' && '__brand' in value && value.__brand === 'LayoutMarker'
}

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

export function useAutoForm() {
  function defineControl<C extends IsComponent>(e: AutoFormControl<C>):
  AutoFormControl<C> {
    return e
  }

  function getAutoFormMetadata(schema: z.ZodType): Record<string, any> {
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

  function getAutoFormLayout(schema: z.ZodType): AutoFormLayoutConfig[] | undefined {
    const layouts = (schema as any)[AUTOFORM_LAYOUT_KEY]
    return Array.isArray(layouts) && layouts.length > 0 ? layouts : undefined
  }

  function getAutoFormFieldOrder(schema: z.ZodType): Array<{ key: string, type: 'layout' | 'field', layoutIndex?: number }> | undefined {
    const fieldOrder = (schema as any)[AUTOFORM_FIELD_ORDER_KEY]
    return Array.isArray(fieldOrder) && fieldOrder.length > 0 ? fieldOrder : undefined
  }

  function createZodFactory<TControls extends AutoFormControls = typeof DEFAULT_CONTROLS>(
    _controls?: TControls
  ): TypedZodFactory<TControls> {
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
    } as unknown as TypedZodFactory<TControls>
  }

  const afz = createZodFactory()

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

  return {
    defineControl, afz, DEFAULT_CONTROLS
  }
}
