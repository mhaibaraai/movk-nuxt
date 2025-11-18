import type { IsComponent } from '../core'
import type { AutoFormControl, AutoFormControls, AutoFormLayoutConfig, TypedZodFactory } from '../types/auto-form'
import { z } from 'zod/v4'
import WithClear from '../components/input/WithClear.vue'
import WithPasswordToggle from '../components/input/WithPasswordToggle.vue'
import WithCopy from '../components/input/WithCopy.vue'
import WithCharacterLimit from '../components/input/WithCharacterLimit.vue'
import DatePicker from '../components/DatePicker.vue'
import ColorChooser from '../components/ColorChooser.vue'
import StarRating from '../components/StarRating.vue'
import {
  UInput,
  UInputNumber,
  UCheckbox,
  USwitch,
  UTextarea,
  USlider,
  UPinInput,
  UInputTags,
  UFileUpload,
  USelect,
  USelectMenu,
  UInputMenu,
  UCheckboxGroup,
  URadioGroup
} from '#components'
import { isObject } from '@movk/core'
import { AUTOFORM_META, CLONE_METHODS } from '../constants/auto-form'
import type { CalendarDate } from '@internationalized/date'
import { useDateFormatter } from './useDateFormatter'
import { extractEnumValuesFromItems } from '../utils/auto-form'

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
        ? { ...(customMeta || {}), ...(args[0] || {}) }
        : customMeta || {}

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

/**
 * 提取错误消息和元数据
 * @param controlMeta - 控件元数据或错误消息字符串
 * @returns [errorMessage, metadata]
 */
function extractErrorAndMeta(controlMeta?: any): [string | undefined, any] {
  if (typeof controlMeta === 'string') {
    return [controlMeta, undefined]
  }

  if (controlMeta && isObject(controlMeta) && 'error' in controlMeta) {
    const { error, ...meta } = controlMeta
    return [error, meta]
  }

  return [undefined, controlMeta]
}

/**
 * 基础字段工厂方法创建器
 * @param zodFactory - Zod 原生工厂函数
 * @returns 增强的工厂方法
 */
function createBasicFactory<T extends z.ZodType>(
  zodFactory: (params?: any) => T
) {
  return (controlMeta?: any): T => {
    const [error, meta] = extractErrorAndMeta(controlMeta)
    const schema = zodFactory(error)
    return applyMeta(schema, meta || {})
  }
}

/**
 * 日期字段工厂（支持泛型覆盖类型）
 */
function createDateFactory() {
  const { isDateValue, isDateRange } = useDateFormatter()
  return <T = CalendarDate>(controlMeta?: any): z.ZodType<T> => {
    const [error, meta] = extractErrorAndMeta(controlMeta)

    const schema = z.custom<T>().refine(
      (val: unknown) => {
        if (isDateValue(val)) {
          return true
        }
        if (val instanceof Date && !Number.isNaN(val.getTime())) {
          return true
        }
        if (isDateRange(val)) {
          const range = val as any
          return isDateValue(range.start) && isDateValue(range.end)
        }
        if (Array.isArray(val)) {
          return val.length > 0 && val.every((item: unknown) => isDateValue(item))
        }
        return false
      },
      { message: error || '无效的日期格式' }
    )

    return applyMeta(schema, { ...(meta || {}), type: 'date' }) as unknown as z.ZodType<T>
  }
}

/**
 * 应用 overwrite 元数据
 */
function applyOverwrite<T extends z.ZodType>(schema: T, overwrite?: any): T {
  return overwrite && isObject(overwrite)
    ? applyMeta(schema, { overwrite })
    : applyMeta(schema, {})
}

/**
 * 对象工厂创建器，支持柯里化和直接调用
 */
/**
 * 对象工厂 - 支持两种模式
 * 1. 普通对象: afz.object({ name: afz.string() })
 * 2. 双参数控件覆盖: afz.object({}, { type: 'enum', controlProps: {...} })
 * 3. 柯里化: afz.object<T>()({}, { type, controlProps })
 */
function createObjectFactory(method: 'object' | 'looseObject' | 'strictObject') {
  return (shapeOrNothing?: any, meta?: any) => {
    if (shapeOrNothing === undefined) {
      return (shape: any, innerMeta?: any) => applyMeta((z as any)[method](shape), innerMeta || {})
    }
    return applyMeta((z as any)[method](shapeOrNothing), meta || {})
  }
}

/**
 * 布局字段工厂
 */
function createLayoutFactory() {
  return <C extends IsComponent = IsComponent>(config: AutoFormLayoutConfig<C>) => {
    return applyMeta(z.custom<AutoFormLayoutConfig<C>>(), {
      type: AUTOFORM_META.LAYOUT_KEY,
      layout: config
    })
  }
}

/**
 * 数组工厂
 */
function createArrayFactory() {
  return (schema: z.ZodType, overwrite?: any) => applyOverwrite(z.array(schema), overwrite)
}

/**
 * 元组工厂
 */
function createTupleFactory() {
  return (schemas: readonly [z.ZodType, ...z.ZodType[]], overwrite?: any) => applyOverwrite(z.tuple(schemas), overwrite)
}

/**
 * 枚举工厂
 */
function createEnumFactory() {
  return (values: any, overwrite?: any) => {
    let enumValues = values
    if ((!values || (Array.isArray(values) && values.length === 0)) && overwrite?.controlProps?.items) {
      const valueKey = overwrite.controlProps.valueKey
      const extractedValues = extractEnumValuesFromItems(overwrite.controlProps.items, valueKey)

      if (extractedValues.length > 0) {
        enumValues = extractedValues
      } else {
        enumValues = []
      }
    }

    if (!enumValues || (Array.isArray(enumValues) && enumValues.length === 0)) {
      return applyOverwrite(z.string(), overwrite)
    }

    return applyOverwrite(z.enum(enumValues), overwrite)
  }
}

const DEFAULT_CONTROL_PROPS = { class: 'w-full' } as const

function defineControl<C extends IsComponent>(e: AutoFormControl<C>): AutoFormControl<C> {
  return e
}

const DEFAULT_CONTROLS = {
  // 基础类型
  string: defineControl({ component: UInput, controlProps: DEFAULT_CONTROL_PROPS }),
  number: defineControl({ component: UInputNumber, controlProps: DEFAULT_CONTROL_PROPS }),
  boolean: defineControl({ component: UCheckbox, controlProps: DEFAULT_CONTROL_PROPS }),
  enum: defineControl({ component: USelect, controlProps: DEFAULT_CONTROL_PROPS }),
  file: defineControl({ component: UFileUpload, controlProps: DEFAULT_CONTROL_PROPS }),
  switch: defineControl({ component: USwitch, controlProps: DEFAULT_CONTROL_PROPS }),
  textarea: defineControl({ component: UTextarea, controlProps: DEFAULT_CONTROL_PROPS }),
  slider: defineControl({ component: USlider, controlProps: DEFAULT_CONTROL_PROPS }),
  pinInput: defineControl({ component: UPinInput, controlProps: DEFAULT_CONTROL_PROPS }),
  inputTags: defineControl({ component: UInputTags, controlProps: DEFAULT_CONTROL_PROPS }),
  selectMenu: defineControl({ component: USelectMenu, controlProps: DEFAULT_CONTROL_PROPS }),
  inputMenu: defineControl({ component: UInputMenu, controlProps: DEFAULT_CONTROL_PROPS }),
  checkboxGroup: defineControl({ component: UCheckboxGroup, controlProps: DEFAULT_CONTROL_PROPS }),
  radioGroup: defineControl({ component: URadioGroup, controlProps: DEFAULT_CONTROL_PROPS }),

  // 自定义增强型组件
  date: defineControl({ component: DatePicker, controlProps: DEFAULT_CONTROL_PROPS }),
  withClear: defineControl({ component: WithClear, controlProps: DEFAULT_CONTROL_PROPS }),
  withPasswordToggle: defineControl({ component: WithPasswordToggle, controlProps: DEFAULT_CONTROL_PROPS }),
  withCopy: defineControl({ component: WithCopy, controlProps: DEFAULT_CONTROL_PROPS }),
  withCharacterLimit: defineControl({ component: WithCharacterLimit, controlProps: DEFAULT_CONTROL_PROPS }),
  colorChooser: defineControl({ component: ColorChooser, controlProps: DEFAULT_CONTROL_PROPS }),
  starRating: defineControl({ component: StarRating, controlProps: DEFAULT_CONTROL_PROPS })
} as const satisfies AutoFormControls

export function useAutoForm<TControls extends AutoFormControls = typeof DEFAULT_CONTROLS>(controls?: TControls) {
  /**
   * 创建类型化的 Zod 工厂对象
   * @param _controls - 可选的自定义控件映射（用于类型推断）
   * @returns 类型化的 Zod 工厂对象
   */
  function createZodFactory<TControls extends AutoFormControls = typeof DEFAULT_CONTROLS>(
    _controls?: TControls
  ) {
    return {
      // 基础类型
      string: createBasicFactory(z.string),
      number: createBasicFactory(z.number),
      boolean: createBasicFactory(z.boolean),
      file: createBasicFactory(z.file),
      date: createDateFactory(),

      // Zod v4 专用验证函数
      email: createBasicFactory(z.email),
      url: createBasicFactory(z.url),
      uuid: createBasicFactory(z.uuid),

      // 集合类型
      array: createArrayFactory(),
      tuple: createTupleFactory(),
      enum: createEnumFactory(),

      // 布局系统
      layout: createLayoutFactory(),

      // 对象类型
      object: createObjectFactory('object'),
      looseObject: createObjectFactory('looseObject'),
      strictObject: createObjectFactory('strictObject')

    } as unknown as TypedZodFactory<TControls, typeof DEFAULT_CONTROLS>
  }

  const builtControls = controls
    ? (Object.fromEntries(
        Object.entries(controls).map(([key, control]) => [
          key,
          defineControl(control as AutoFormControl<IsComponent>)
        ])
      ) as TControls)
    : undefined

  const afz = createZodFactory(builtControls as TControls)

  return {
    defineControl,
    afz,
    DEFAULT_CONTROLS,
    controls,
    getAutoFormMetadata
  }
}
