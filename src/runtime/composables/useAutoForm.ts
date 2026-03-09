import type { IsComponent } from '@movk/core'
import type { AutoFormControl, AutoFormControls, AutoFormLayoutConfig, TypedZodFactory, _Unset } from '../types/auto-form'
import type { CalendarDate, DateValue, Time } from '@internationalized/date'
import type { DateRange } from 'reka-ui'
import type {
  InputProps, InputSlots,
  TextareaProps, TextareaSlots
} from '@nuxt/ui'
import { z } from 'zod'
import WithClear from '../components/input/WithClear.vue'
import WithPasswordToggle from '../components/input/WithPasswordToggle.vue'
import WithCopy from '../components/input/WithCopy.vue'
import WithCharacterLimit from '../components/input/WithCharacterLimit.vue'
import DatePicker from '../components/DatePicker.vue'
import ColorChooser from '../components/ColorChooser.vue'
import StarRating from '../components/StarRating.vue'
import SlideVerify from '../components/SlideVerify.vue'
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
  URadioGroup,
  UInputDate,
  UInputTime
} from '#components'
import { isObject } from '@movk/core'
import { AUTOFORM_META } from '../constants/auto-form'
import { useDateFormatter } from './useDateFormatter'
import { extractEnumValuesFromItems } from '../utils/auto-form'

type AutoFormMetadata = Record<string, unknown>

/**
 * 应用元数据到 Zod schema
 * @description 使用 Zod v4 原生 meta API。
 */
function applyMeta<T extends z.ZodType>(schema: T, meta?: unknown): T {
  const normalizedMeta = isObject(meta) ? meta as AutoFormMetadata : {}
  return schema.meta(normalizedMeta) as T
}

/**
 * 从 Zod schema 中提取 AutoForm 元数据
 * @description
 * 不再依赖克隆方法拦截，而是通过 BFS 遍历以下路径读取 meta：
 * - schema.meta() — Zod v4 全局 registry
 * - schema._zod.parent — .refine()/.check() 创建新实例时设置的父引用
 * - schema.unwrap() — 可选/默认值等包装类型
 * - schema.def.innerType / .in / .out / .schema — 结构性内层类型
 *
 * 收集所有层级的 meta 并合并，外层（先找到的）优先级更高。
 */
function getAutoFormMetadata(schema: z.ZodType): Record<string, any> {
  const queue: unknown[] = [schema]
  const visited = new Set<unknown>()
  const collectedMetas: AutoFormMetadata[] = []

  while (queue.length > 0) {
    const current = queue.shift() as any
    if (!current || visited.has(current))
      continue

    visited.add(current)

    const meta = typeof current.meta === 'function' ? current.meta() : undefined
    if (meta && isObject(meta)) {
      const typedMeta = meta as AutoFormMetadata
      const normalizedMeta = typedMeta?.[AUTOFORM_META.KEY] && isObject(typedMeta[AUTOFORM_META.KEY])
        ? typedMeta[AUTOFORM_META.KEY] as AutoFormMetadata
        : typedMeta
      collectedMetas.push(normalizedMeta)
    }

    if (typeof current.unwrap === 'function') {
      try {
        queue.push(current.unwrap())
      } catch {
        // unwrap 失败时忽略
      }
    }

    // 跟踪 Zod v4 的 _zod.parent 链路
    // .refine()/.check() 等方法通过 core.clone(inst, def, { parent: true }) 创建新实例，
    // 新实例不在 globalRegistry 中，但通过 _zod.parent 持有对原实例的引用
    if (current?._zod?.parent)
      queue.push(current._zod.parent)

    const def = current?.def || current?._def
    if (def?.innerType)
      queue.push(def.innerType)
    if (def?.in)
      queue.push(def.in)
    if (def?.out)
      queue.push(def.out)
    if (def?.schema)
      queue.push(def.schema)
  }

  if (collectedMetas.length === 0)
    return {}

  // 内层 meta 提供基础字段（type、controlProps 等），外层 meta 覆盖（description、label 等）
  // collectedMetas[0] = 最外层，collectedMetas[n] = 最内层
  // reverse 后 assign：内层先写入，外层后覆盖
  return Object.assign({}, ...collectedMetas.reverse())
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
 * 日期字段工厂 - 用于 DatePicker/Calendar
 * 支持 CalendarDate、DateRange、CalendarDate[]
 */
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

/**
 * 输入时间字段工厂 - 用于 UInputTime
 * 返回 Time 类型
 */
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

/**
 * 通用 ISO 字符串工厂创建器
 * @param type - ISO 类型
 *   - `datetime`: ISO 8601 日期时间字符串
 *   - `date`: YYYY-MM-DD 日期字符串
 *   - `time`: HH:MM[:SS[.s+]] 时间字符串
 */
function createISOFactory(type: 'datetime' | 'date' | 'time') {
  return (controlMeta?: any) => {
    const [error, meta] = extractErrorAndMeta(controlMeta)
    const schema = z.iso[type](error)
    return applyMeta(schema, meta || {})
  }
}

/**
 * 应用 overwrite 元数据
 */
function applyOverwrite<T extends z.ZodType>(schema: T, overwrite?: any): T {
  return applyMeta(schema, overwrite && isObject(overwrite) ? { overwrite } : undefined)
}

function createObjectFactory(method: 'object' | 'looseObject' | 'strictObject') {
  const createSchema = (shape: any) => (z as any)[method](shape)

  return (shapeOrNothing?: any, meta?: any) => {
    if (shapeOrNothing === undefined) {
      return (shape: any, innerMeta?: any) => applyMeta(createSchema(shape), innerMeta)
    }

    return applyMeta(createSchema(shapeOrNothing), meta)
  }
}

/**
 * 布局字段工厂
 */
function layoutFactory<C extends IsComponent = IsComponent>(config: AutoFormLayoutConfig<C>) {
  return applyMeta(z.custom<AutoFormLayoutConfig<C>>(), {
    type: AUTOFORM_META.LAYOUT_KEY,
    layout: config
  })
}

/**
 * 数组工厂
 */
function arrayFactory(schema: z.ZodType, overwrite?: any) {
  return applyOverwrite(z.array(schema), overwrite)
}

/**
 * 元组工厂
 */
function tupleFactory(schemas: readonly [z.ZodType, ...z.ZodType[]], overwrite?: any) {
  return applyOverwrite(z.tuple(schemas), overwrite)
}

/**
 * 枚举工厂
 */
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

const DEFAULT_CONTROL_PROPS = { class: 'w-full' } as const

function defineControl<C extends IsComponent, P = _Unset, S = _Unset>(e: AutoFormControl<C, P, S>): AutoFormControl<C, P, S> {
  return e
}

const DEFAULT_CONTROLS: {
  readonly string: AutoFormControl<typeof UInput, InputProps, InputSlots>
  readonly number: AutoFormControl<typeof UInputNumber>
  readonly boolean: AutoFormControl<typeof UCheckbox>
  readonly enum: AutoFormControl<typeof USelect>
  readonly file: AutoFormControl<typeof UFileUpload>
  readonly calendarDate: AutoFormControl<typeof DatePicker>
  readonly datePicker: AutoFormControl<typeof DatePicker>
  readonly switch: AutoFormControl<typeof USwitch>
  readonly textarea: AutoFormControl<typeof UTextarea, TextareaProps, TextareaSlots>
  readonly slider: AutoFormControl<typeof USlider>
  readonly pinInput: AutoFormControl<typeof UPinInput>
  readonly inputTags: AutoFormControl<typeof UInputTags>
  readonly selectMenu: AutoFormControl<typeof USelectMenu>
  readonly inputMenu: AutoFormControl<typeof UInputMenu>
  readonly checkboxGroup: AutoFormControl<typeof UCheckboxGroup>
  readonly radioGroup: AutoFormControl<typeof URadioGroup>
  readonly inputDate: AutoFormControl<typeof UInputDate>
  readonly inputTime: AutoFormControl<typeof UInputTime>
  readonly withClear: AutoFormControl<typeof WithClear>
  readonly withPasswordToggle: AutoFormControl<typeof WithPasswordToggle>
  readonly withCopy: AutoFormControl<typeof WithCopy>
  readonly withCharacterLimit: AutoFormControl<typeof WithCharacterLimit>
  readonly colorChooser: AutoFormControl<typeof ColorChooser>
  readonly starRating: AutoFormControl<typeof StarRating>
  readonly slideVerify: AutoFormControl<typeof SlideVerify>
} = {
  // 基础类型
  string: defineControl({ component: UInput, controlProps: DEFAULT_CONTROL_PROPS }),
  number: defineControl({ component: UInputNumber, controlProps: DEFAULT_CONTROL_PROPS }),
  boolean: defineControl({ component: UCheckbox, controlProps: DEFAULT_CONTROL_PROPS }),
  enum: defineControl({ component: USelect, controlProps: DEFAULT_CONTROL_PROPS }),
  file: defineControl({ component: UFileUpload, controlProps: DEFAULT_CONTROL_PROPS }),
  calendarDate: defineControl({ component: DatePicker, controlProps: DEFAULT_CONTROL_PROPS }),
  datePicker: defineControl({ component: DatePicker, controlProps: DEFAULT_CONTROL_PROPS }),

  // 扩展类型
  switch: defineControl({ component: USwitch, controlProps: DEFAULT_CONTROL_PROPS }),
  textarea: defineControl({ component: UTextarea, controlProps: DEFAULT_CONTROL_PROPS }),
  slider: defineControl({ component: USlider, controlProps: DEFAULT_CONTROL_PROPS }),
  pinInput: defineControl({ component: UPinInput, controlProps: DEFAULT_CONTROL_PROPS }),
  inputTags: defineControl({ component: UInputTags, controlProps: DEFAULT_CONTROL_PROPS }),
  selectMenu: defineControl({ component: USelectMenu, controlProps: DEFAULT_CONTROL_PROPS }),
  inputMenu: defineControl({ component: UInputMenu, controlProps: DEFAULT_CONTROL_PROPS }),
  checkboxGroup: defineControl({ component: UCheckboxGroup, controlProps: DEFAULT_CONTROL_PROPS }),
  radioGroup: defineControl({ component: URadioGroup, controlProps: DEFAULT_CONTROL_PROPS }),
  inputDate: defineControl({ component: UInputDate, controlProps: DEFAULT_CONTROL_PROPS }),
  inputTime: defineControl({ component: UInputTime, controlProps: DEFAULT_CONTROL_PROPS }),

  // 自定义增强型组件
  withClear: defineControl({ component: WithClear, controlProps: DEFAULT_CONTROL_PROPS }),
  withPasswordToggle: defineControl({ component: WithPasswordToggle, controlProps: DEFAULT_CONTROL_PROPS }),
  withCopy: defineControl({ component: WithCopy, controlProps: DEFAULT_CONTROL_PROPS }),
  withCharacterLimit: defineControl({ component: WithCharacterLimit, controlProps: DEFAULT_CONTROL_PROPS }),
  colorChooser: defineControl({ component: ColorChooser, controlProps: DEFAULT_CONTROL_PROPS }),
  starRating: defineControl({ component: StarRating, controlProps: DEFAULT_CONTROL_PROPS }),
  slideVerify: defineControl({ component: SlideVerify, controlProps: DEFAULT_CONTROL_PROPS })
}

export function useAutoForm<TControls extends AutoFormControls = typeof DEFAULT_CONTROLS>(controls?: TControls) {
  type FinalControls = typeof DEFAULT_CONTROLS & TControls

  /**
   * 创建类型化的 Zod 工厂对象
   * @returns 类型化的 Zod 工厂对象
   */
  function createZodFactory<TFactoryControls extends AutoFormControls>(): TypedZodFactory<TFactoryControls> {
    return {
      // 基础类型
      string: createBasicFactory(z.string),
      number: createBasicFactory(z.number),
      boolean: createBasicFactory(z.boolean),
      file: createBasicFactory(z.file),

      // 日期和时间类型
      calendarDate: createCalendarDateFactory(),
      inputDate: createCalendarDateFactory('inputDate'),
      inputTime: inputTimeFactory,

      // ISO 字符串类型
      isoDatetime: createISOFactory('datetime'),
      isoDate: createISOFactory('date'),
      isoTime: createISOFactory('time'),

      // Zod v4 专用验证函数
      email: createBasicFactory(z.email),
      url: createBasicFactory(z.url),
      uuid: createBasicFactory(z.uuid),

      // 集合类型
      array: arrayFactory,
      tuple: tupleFactory,
      enum: createEnumFactory(),

      // 布局系统
      layout: layoutFactory,

      // 对象类型
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
  }
}
