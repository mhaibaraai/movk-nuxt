import type { IsComponent } from '@movk/core'
import type { AutoFormControls, AutoFormLayoutConfig, TypedZodFactory } from '../types/auto-form'
import type { CalendarDate, DateValue, Time } from '@internationalized/date'
import type { DateRange } from 'reka-ui'
import { z } from 'zod'
import { isObject } from '@movk/core'
import { AUTOFORM_META } from '../constants/auto-form'
import { applyMeta, extractErrorAndMeta, getAutoFormMetadata } from '../auto-form/metadata'
import { DEFAULT_CONTROLS, defineControl } from '../auto-form/controls'
import { extractEnumValuesFromItems } from '../auto-form/field-utils'
import { useDateFormatter } from './useDateFormatter'

/** 创建基础类型 schema 工厂，统一处理 error 字符串和 meta 对象两种入参形式 */
function createBasicFactory<T extends z.ZodType>(
  zodFactory: (params?: any) => T
) {
  return (controlMeta?: any): T => {
    const [error, meta] = extractErrorAndMeta(controlMeta)
    const schema = zodFactory(error)
    return applyMeta(schema, meta || {})
  }
}

/** 创建日期选择 schema 工厂，校验 DateValue/DateRange/DateValue[] 三种格式 */
function createCalendarDateFactory(type: 'calendarDate' | 'inputDate' = 'calendarDate') {
  const { isDateValue, isDateRange } = useDateFormatter()
  return <T extends DateValue | DateRange | DateValue[] = CalendarDate>(
    controlMeta?: any
  ): z.ZodType<T> => {
    const [error, meta] = extractErrorAndMeta(controlMeta)

    const schema = z.custom<T>().refine(
      (val: unknown) => {
        if (isDateValue(val)) return true
        if (isDateRange(val)) {
          const range = val as DateRange
          return isDateValue(range.start) && isDateValue(range.end)
        }
        if (Array.isArray(val)) {
          return val.length > 0 && val.every((item: unknown) => isDateValue(item))
        }
        return false
      },
      { message: error || '无效的日期格式' }
    )

    const finalType = meta?.type || type
    return applyMeta(schema, { ...(meta || {}), type: finalType }) as unknown as z.ZodType<T>
  }
}

/** 创建时间选择 schema 工厂，校验 @internationalized/date 的 Time 对象格式 */
function inputTimeFactory(controlMeta?: any): z.ZodType<Time> {
  const [error, meta] = extractErrorAndMeta(controlMeta)

  const schema = z.custom<Time>().refine(
    (val: unknown) => {
      return (
        val !== null
        && val !== undefined
        && typeof val === 'object'
        && 'hour' in val
        && 'minute' in val
        && typeof (val as any).hour === 'number'
        && typeof (val as any).minute === 'number'
      )
    },
    { message: error || '无效的时间格式' }
  )

  return applyMeta(schema, { ...(meta || {}), type: 'inputTime' })
}

/** 创建 ISO 格式日期时间 schema 工厂（datetime/date/time） */
function createISOFactory(type: 'datetime' | 'date' | 'time') {
  return (controlMeta?: any) => {
    const [error, meta] = extractErrorAndMeta(controlMeta)
    const schema = z.iso[type](error)
    return applyMeta(schema, meta || {})
  }
}

function applyOverwrite<T extends z.ZodType>(schema: T, overwrite?: any): T {
  return applyMeta(schema, overwrite && isObject(overwrite) ? { overwrite } : undefined)
}

/** 创建对象 schema 工厂，支持柯里化（先传 meta 再传 shape）和直接调用两种形式 */
function createObjectFactory(method: 'object' | 'looseObject' | 'strictObject') {
  const createSchema = (shape: any) => (z as any)[method](shape)

  return (shapeOrNothing?: any, meta?: any) => {
    if (shapeOrNothing === undefined) {
      return (shape: any, innerMeta?: any) => applyMeta(createSchema(shape), innerMeta)
    }

    return applyMeta(createSchema(shapeOrNothing), meta)
  }
}

/** 创建布局占位 schema，将布局配置嵌入 meta 中供 schema-introspector 识别 */
function layoutFactory<C extends IsComponent = IsComponent>(config: AutoFormLayoutConfig<C>) {
  return applyMeta(z.custom<AutoFormLayoutConfig<C>>(), {
    type: AUTOFORM_META.LAYOUT_KEY,
    layout: config
  })
}

function arrayFactory(schema: z.ZodType, overwrite?: any) {
  return applyOverwrite(z.array(schema), overwrite)
}

function tupleFactory(schemas: readonly [z.ZodType, ...z.ZodType[]], overwrite?: any) {
  return applyOverwrite(z.tuple(schemas), overwrite)
}

/** 创建枚举 schema 工厂：values 为空时尝试从 controlProps.items 自动推断枚举值 */
function createEnumFactory() {
  return (values: any, overwrite?: any) => {
    let enumValues = values

    if ((!values || (Array.isArray(values) && values.length === 0)) && overwrite?.controlProps?.items) {
      const valueKey = overwrite.controlProps.valueKey
      enumValues = extractEnumValuesFromItems(overwrite.controlProps.items, valueKey)
    }

    if (!enumValues || (Array.isArray(enumValues) && enumValues.length === 0)) {
      return applyOverwrite(z.string(), overwrite)
    }

    return applyOverwrite(z.enum(enumValues), overwrite)
  }
}

export { defineControl, DEFAULT_CONTROLS, getAutoFormMetadata }

type UseAutoFormReturn<TControls extends AutoFormControls> = {
  defineControl: typeof defineControl
  afz: TypedZodFactory<TControls>
  DEFAULT_CONTROLS: typeof DEFAULT_CONTROLS
  controls: TControls
  getAutoFormMetadata: typeof getAutoFormMetadata
}

/**
 * 初始化 AutoForm，返回绑定了 controls 类型的 afz 工厂和工具方法。
 * 可传入自定义 controls 以扩展或覆盖默认控件映射。
 */
export function useAutoForm(): UseAutoFormReturn<typeof DEFAULT_CONTROLS>
export function useAutoForm<const TControls extends AutoFormControls>(
  controls: TControls
): UseAutoFormReturn<typeof DEFAULT_CONTROLS & TControls>
export function useAutoForm<const TControls extends AutoFormControls>(controls?: TControls) {
  type FinalControls = typeof DEFAULT_CONTROLS & (TControls extends AutoFormControls ? TControls : {})

  /** 构建与当前 controls 类型绑定的 Zod schema 工厂方法集合 */
  function createZodFactory<const TFactoryControls extends AutoFormControls>(): TypedZodFactory<TFactoryControls> {
    return {
      string: createBasicFactory(z.string),
      number: createBasicFactory(z.number),
      boolean: createBasicFactory(z.boolean),
      file: createBasicFactory(z.file),

      calendarDate: createCalendarDateFactory(),
      inputDate: createCalendarDateFactory('inputDate'),
      inputTime: inputTimeFactory,

      isoDatetime: createISOFactory('datetime'),
      isoDate: createISOFactory('date'),
      isoTime: createISOFactory('time'),

      email: createBasicFactory(z.email),
      url: createBasicFactory(z.url),
      uuid: createBasicFactory(z.uuid),

      array: arrayFactory,
      tuple: tupleFactory,
      enum: createEnumFactory(),

      layout: layoutFactory,

      object: createObjectFactory('object'),
      looseObject: createObjectFactory('looseObject'),
      strictObject: createObjectFactory('strictObject')
    } as unknown as TypedZodFactory<TFactoryControls>
  }

  const mergedControls = (controls
    ? { ...DEFAULT_CONTROLS, ...controls }
    : DEFAULT_CONTROLS) as FinalControls

  const afz = createZodFactory<FinalControls>()

  return {
    defineControl,
    afz,
    DEFAULT_CONTROLS,
    controls: mergedControls,
    getAutoFormMetadata
  } as UseAutoFormReturn<FinalControls>
}
