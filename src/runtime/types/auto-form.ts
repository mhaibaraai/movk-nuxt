import type { CollapsibleRootProps, DateRange } from 'reka-ui'
import type { ClassNameValue } from 'tailwind-merge'
import type { z } from 'zod'
import type {
  ArrayFieldKeys,
  ComponentProps,
  ComponentSlots,
  GetFieldValue,
  IsAny,
  IsComponent,
  KnownKeys,
  NonObjectFieldKeys,
  ObjectFieldKeys,
  Prettify,
  ReactiveValue,
  UnionToIntersection,
  WidenLiteral
} from '@movk/core'
import type { FormError } from '@nuxt/ui'
import type { AUTOFORM_META } from '../constants/auto-form'
import type { CalendarDate, DateValue, Time } from '@internationalized/date'
import type { ZodAutoFormFieldMeta } from './zod'

// 提取字段值类型
type FieldValueType<S, P extends string> = P extends string
  ? (string extends P ? S[keyof S] : GetFieldValue<S, P>)
  : S[keyof S]

// 排除 undefined 后的类型
type NonUndefinedFieldValue<S, P extends string> = Exclude<FieldValueType<S, P>, undefined>

/**
 * 相对路径类型 - 根据字段值类型自动推断可用路径
 * @template T - 字段值类型
 * @description
 * - 对象类型：返回对象的键（'name' | 'email' | 'bio'）
 * - 数组类型：返回 string（支持任意索引路径如 '[0].title'）
 */
type RelativePath<T> = T extends readonly any[]
  ? string
  : T extends Record<string, any>
    ? Extract<keyof T, string>
    : string

/**
 * 表单字段上下文
 * @template S - 表单数据类型
 * @template P - 字段路径
 */
export interface AutoFormFieldContext<S = any, P extends string = string> {
  /** 表单数据 */
  readonly state: S
  /** 字段路径 */
  readonly path: P
  /** 字段值（可能为 undefined） */
  readonly value: FieldValueType<S, P>
  /**
   * 设置字段值的回调函数
   * @description 支持多种调用方式：
   * 1. setValue(value) - 设置当前字段的整个值
   * 2. setValue(key, value) - 设置子字段值（对象）或元素属性（数组）
   * 3. setValue(path, value) - 设置任意路径的值（字符串回退）
   * @example
   * // 对象字段 profile: { name, email, bio }
   * setValue({ name: '张三', email: 'test@example.com' })  // 设置整个对象
   * setValue('name', '张三')  // key 自动推断为 'name' | 'email' | 'bio'
   *
   * // 数组字段 tasks: [{ title, priority, completed }]
   * setValue([...tasks, newTask])  // 设置整个数组
   * setValue('[0].title', '新标题')  // 使用索引路径字符串
   *
   * // 或者在遍历中直接使用属性名（推荐）
   * v-for="(task, index) in tasks"
   * setValue(`[${index}].title`, value)  // 动态索引
   */
  setValue: {
    (value: FieldValueType<S, P>): void
    <K extends RelativePath<NonUndefinedFieldValue<S, P>>>(
      relativePath: K extends never ? string : K,
      value: any
    ): void
    (relativePath: string, value: any): void
  }

  /** 字段错误列表 */
  readonly errors: unknown[]
  /** 表单提交加载状态 */
  readonly loading: boolean
  /** 字段折叠状态 */
  readonly open?: boolean
  /** 数组元素下标 */
  readonly count?: number
}

/**
 * 表单字段插槽定义 - 支持自定义渲染各个部分
 */
export interface AutoFormFieldSlots {
  label: (props: { label?: string } & AutoFormFieldContext) => unknown
  hint: (props: { hint?: string } & AutoFormFieldContext) => unknown
  description: (props: { description?: string } & AutoFormFieldContext) => unknown
  help: (props: { help?: string } & AutoFormFieldContext) => unknown
  error: (props: { error?: boolean | string } & AutoFormFieldContext) => unknown
  default: (props: { error?: boolean | string } & AutoFormFieldContext) => unknown
}

type DynamicFieldSlotKeys = keyof AutoFormFieldSlots

type SlotTypeExtraProps<SlotType extends DynamicFieldSlotKeys>
  = SlotType extends 'label' ? { label?: string }
    : SlotType extends 'hint' ? { hint?: string }
      : SlotType extends 'description' ? { description?: string }
        : SlotType extends 'help' ? { help?: string }
          : SlotType extends 'error' ? { error?: boolean | string }
            : SlotType extends 'default' ? { error?: boolean | string }
              : {}

type FieldSlotFunction<T, K extends DynamicFieldSlotKeys, P extends string>
  = (props: SlotTypeExtraProps<K> & AutoFormFieldContext<T, P>) => unknown

type FieldSlotsMapping<T, K extends DynamicFieldSlotKeys, P extends string> = {
  [Path in P as `field-${K}:${Path}`]: FieldSlotFunction<T, K, Path>
}

/**
 * 动态表单插槽类型
 * @template T - 表单数据类型
 *
 * 插槽命名：
 * - 通用：`field-{slotType}`
 * - 字段：`field-{slotType}:{fieldKey}` - 精确推导字段类型
 * - 嵌套：`field-{content|before|after}:{objectKey|arrayKey}`
 */
type AllFieldKeys<T> = NonObjectFieldKeys<T> | ObjectFieldKeys<T>

export type DynamicFormSlots<T>
  = Record<string, (props: AutoFormFieldContext<T>) => unknown>
    & {
      [K in DynamicFieldSlotKeys as `field-${K}`]: (props: SlotTypeExtraProps<K> & AutoFormFieldContext<T>) => unknown
    }
    & FieldSlotsMapping<T, 'label', AllFieldKeys<T>>
    & FieldSlotsMapping<T, 'hint', AllFieldKeys<T>>
    & FieldSlotsMapping<T, 'description', AllFieldKeys<T>>
    & FieldSlotsMapping<T, 'help', AllFieldKeys<T>>
    & FieldSlotsMapping<T, 'error', AllFieldKeys<T>>
    & FieldSlotsMapping<T, 'default', AllFieldKeys<T>>
    & {
      [P in ObjectFieldKeys<T> | ArrayFieldKeys<T> as `field-${'content' | 'before' | 'after'}:${P}`]: (props: AutoFormFieldContext<T, P>) => unknown
    }

/**
 * 表单级插槽属性
 * @template T - 表单对象类型
 */
export interface AutoFormSlotProps<T extends object> {
  /** 表单错误列表 */
  errors: FormError[]
  /** 表单提交加载状态 */
  loading: boolean
  /** 字段配置列表 */
  fields: AutoFormField[]
  /** 表单当前状态 */
  state: T
}

/**
 * 控件元数据统一模型 - 支持响应式属性
 * @template C - 组件类型
 */
export interface AutoFormControlsMeta<C extends IsComponent = IsComponent> {
  /** 控件类型（从注册的控件中选择） */
  type?: string
  /** 控件组件（直接传入组件实例时使用） */
  component?: C
  /** 控件属性（支持响应式函数） */
  controlProps?: ReactiveValue<ComponentProps<C>, AutoFormFieldContext>
  /** 控件插槽（支持部分覆盖，支持响应式函数） */
  controlSlots?: ReactiveValue<Partial<ComponentSlots<C>>, AutoFormFieldContext> | Record<string, unknown>
  /** Zod 验证错误消息 */
  error?: string
}

/** 幻影类型哨兵：标记 P/S 未被覆写 */
export type _Unset = { readonly __brand: 'AutoFormControlUnset' }

/**
 * 控件实例配置 - 运行时使用的简化版本
 * @template C - 组件类型
 * @template _P - Props 类型覆写（phantom，仅用于工厂方法推断）
 * @template _S - Slots 类型覆写（phantom，仅用于工厂方法推断）
 */
export interface AutoFormControl<
  C extends IsComponent = IsComponent,
  _P = _Unset,
  _S = _Unset
> {
  /** 控件组件实例 */
  component: C
  /** 控件静态属性 */
  controlProps?: ComponentProps<C>
  /** 控件静态插槽 */
  controlSlots?: Partial<ComponentSlots<C>>
}

/**
 * 控件注册表类型 - 字符串键映射到控件配置
 */

export type AutoFormControls = Record<string, AutoFormControl<any, any, any>>

/**
 * 自动表单布局配置 - 支持自定义布局容器
 * @template C - 布局组件类型
 */
export interface AutoFormLayoutConfig<C extends IsComponent = IsComponent> {
  /** 布局容器组件 */
  component?: C
  /** 布局组件属性（根据组件类型自动推断，支持响应式） */
  props?: ReactiveValue<ComponentProps<C>, AutoFormFieldContext>
  /** 布局组件 CSS 类名（支持响应式） */
  class?: ReactiveValue<ClassNameValue, AutoFormFieldContext>
  /** 布局组件插槽（根据组件类型自动推断，支持响应式） */
  slots?: ReactiveValue<Partial<ComponentSlots<C>>, AutoFormFieldContext>
  /** 布局内的字段定义（类似 z.object() 的 shape） */
  fields: Record<string, z.ZodType>
  /** 所有字段统一渲染到的插槽名称（支持响应式） */
  fieldSlot?: ReactiveValue<keyof ComponentSlots<C> & string, AutoFormFieldContext>
  /** 字段到插槽的映射关系（支持响应式，优先级高于 fieldSlot） */
  fieldSlots?: ReactiveValue<Partial<Record<string, keyof ComponentSlots<C> & string>>, AutoFormFieldContext>
}

/**
 * 合并后的元数据类型 - 包含全局元数据、控件元数据、布局和覆写
 */
export type AutoFormMergeMeta = ZodAutoFormFieldMeta
  & AutoFormControlsMeta
  & {
    /** 已映射的控件实例（运行时生成） */
    mapped?: AutoFormControl
    /** 布局配置 */
    layout?: AutoFormLayoutConfig
    /** 覆写元数据（优先级最高） */
    overwrite?: AutoFormControlsMeta
  }

/**
 * 自动表单字段配置 - 描述单个表单字段的完整信息
 */
export interface AutoFormField {
  /** 字段路径（点分隔符格式） */
  path: string
  /** 字段的 Zod schema 定义 */
  schema: z.ZodType
  /** 字段元数据（包含控件配置、布局等） */
  meta: AutoFormMergeMeta
  /** 字段装饰器信息（可选性、只读、默认值等） */
  decorators: {
    /** 是否为可选字段 */
    isOptional?: boolean
    /** 是否为只读字段 */
    isReadonly?: boolean
    /** 默认值 */
    defaultValue?: unknown
    /** 字段描述 */
    description?: string
  }
  /** 子字段列表（仅对象类型字段有效） */
  children?: AutoFormField[]
  /** 数组元素模板（仅数组类型字段有效） */
  arrayElement?: AutoFormField
}

/**
 * 嵌套字段折叠配置 - 控制对象/数组字段的展开/收起行为
 */
export interface AutoFormNestedCollapsible extends Pick<CollapsibleRootProps, 'defaultOpen' | 'open' | 'disabled' | 'unmountOnHide'> {
  /**
   * 是否启用折叠功能
   * @defaultValue true
   * @description 当设置为 false 时将直接渲染内容，不使用折叠组件
   */
  enabled?: boolean
  /**
   * 渲染的元素或组件类型
   * @defaultValue 'div'
   */
  as?: unknown
  /** CSS 类名 */
  class?: unknown
  /** UI 配置 */
  ui?: {
    /** 根元素类名 */
    root?: ClassNameValue
    /** 内容区域类名 */
    content?: ClassNameValue
  }
}

/**
 * 布局标记类型 - 用于类型层面识别布局字段
 * @template Fields - 布局内的字段定义
 * @description 运行时会被替换为 ZodCustom，仅用于类型推导
 */
interface LayoutFieldMarker<Fields extends Record<string, z.ZodType>> extends z.ZodType<AutoFormLayoutConfig<any>, any, any> {
  __brand: typeof AUTOFORM_META.LAYOUT_KEY
  fields: Fields
}

/**
 * 轻量布局展开类型
 * @description
 * 为保证编辑器类型性能，仅做一层 layout 字段展开。
 * 运行时仍通过 extractPureSchema 处理完整 layout 结构。
 */
type LayoutRestShape<S extends Record<string, any>> = {
  [P in keyof S as S[P] extends LayoutFieldMarker<any> ? never : P]: S[P]
}

type LayoutExpandedShape<S extends Record<string, any>> = UnionToIntersection<
  {
    [P in keyof S]: S[P] extends LayoutFieldMarker<infer Fields> ? Fields : {}
  }[keyof S]
>

type ExtractLayoutShape<S extends Record<string, any>> = LayoutRestShape<S> & LayoutExpandedShape<S>

/**
 * 从 ComponentProps 中移除索引签名，只保留已知属性键
 * 用于工厂方法的 controlProps 自动补全，防止 `string` 索引污染 IntelliSense
 */
type StrictComponentProps<C extends IsComponent> = {
  [K in keyof ComponentProps<C> as {} extends Record<K, unknown> ? never : K]: ComponentProps<C>[K]
}

/** ComponentSlots 的 any 安全包装：当结果为 any 时回退为 {} */
type StrictComponentSlots<C extends IsComponent>
  = IsAny<ComponentSlots<C>> extends true ? {} : ComponentSlots<C>

type ControlKey<TControls extends AutoFormControls> = Extract<KnownKeys<TControls>, string>

/** 保留完整类型（含 phantom P/S），不重新包装 */
type ControlEntryByKey<TControls extends AutoFormControls, K extends string>
  = K extends keyof TControls ? TControls[K] : never

/** 工厂级 Props 宽化：所有属性强制可选（+?），值类型通过 WidenLiteral 放宽 */
type _WidenForFactory<T> = {
  [K in keyof T]+?: WidenLiteral<T[K]>
}

/** 提取控件的 Props 覆写（phantom P），未覆写时回退到 StrictComponentProps */

type ExtractControlProps<T> = T extends AutoFormControl<infer C, infer P, any>
  ? [P] extends [_Unset] ? StrictComponentProps<C> : Prettify<_WidenForFactory<P> & {}>
  : {}

/** 提取控件的 Slots 覆写（phantom S），未覆写时回退到 StrictComponentSlots */

type ExtractControlSlots<T> = T extends AutoFormControl<infer C, any, infer S>
  ? [S] extends [_Unset] ? StrictComponentSlots<C> : S
  : {}

type ControlPropsByKey<
  TControls extends AutoFormControls,
  K extends ControlKey<TControls>
> = Prettify<ExtractControlProps<ControlEntryByKey<TControls, K>>> & Record<string, unknown>

type ControlSlotsByKey<
  TControls extends AutoFormControls,
  K extends ControlKey<TControls>
> = Partial<ExtractControlSlots<ControlEntryByKey<TControls, K>>>

/** 控件元数据公共字段（controlProps / controlSlots / error） */
type MetaPropsFor<
  TControls extends AutoFormControls,
  K extends ControlKey<TControls>
> = {
  controlProps?: ReactiveValue<ControlPropsByKey<TControls, K>, AutoFormFieldContext>
  controlSlots?: ReactiveValue<ControlSlotsByKey<TControls, K>, AutoFormFieldContext> | Record<string, unknown>
  error?: string
}

type MetaByControlKey<
  TControls extends AutoFormControls,
  K extends ControlKey<TControls>
> = { type: K, component?: never } & MetaPropsFor<TControls, K>

type MetaByComponent<C extends IsComponent> = {
  component: C
  type?: never
} & Omit<AutoFormControlsMeta<C>, 'component' | 'type'>

type MetaByDefaultIfExists<
  TControls extends AutoFormControls,
  TDefaultKey extends string
> = TDefaultKey extends ControlKey<TControls>
  ? { component?: never, type?: never } & MetaPropsFor<TControls, TDefaultKey>
  : never

type ObjectShape = Record<string, z.ZodType>

type TypedObjectShape<T extends object> = Partial<Record<Extract<keyof T, string>, z.ZodType>>

/** 对象工厂重载（统一 Curried 和 Direct，通过 ShapeConstraint 区分） */
type ObjectFactoryOverloads<
  TControls extends AutoFormControls,
  Mode extends z.core.$strip | z.core.$loose | z.core.$strict,
  TDefaultKey extends string,
  ShapeConstraint = {}
> = {
  <S extends ObjectShape, K extends ControlKey<TControls>>(shape: S & ShapeConstraint, meta?: MetaByControlKey<TControls, K>): z.ZodObject<ExtractLayoutShape<S>, Mode>
  <S extends ObjectShape>(shape: S & ShapeConstraint, meta: MetaByDefaultIfExists<TControls, TDefaultKey>): z.ZodObject<ExtractLayoutShape<S>, Mode>
  <S extends ObjectShape, C extends IsComponent>(shape: S & ShapeConstraint, meta: MetaByComponent<C>): z.ZodObject<ExtractLayoutShape<S>, Mode>
}

type ObjectFactoryCurried<
  TControls extends AutoFormControls,
  T extends object,
  Mode extends z.core.$strip | z.core.$loose | z.core.$strict,
  TDefaultKey extends string
> = ObjectFactoryOverloads<TControls, Mode, TDefaultKey, TypedObjectShape<T>>

type ObjectFactoryDirect<
  TControls extends AutoFormControls,
  Mode extends z.core.$strip | z.core.$loose | z.core.$strict,
  TDefaultKey extends string
> = ObjectFactoryOverloads<TControls, Mode, TDefaultKey>

/**
 * 轻量工厂方法类型
 * @description
 * - 默认分支：根据方法名推导默认控件 props（如 string -> UInput props）
 * - type 分支：根据 `type` 推导对应控件 props（使用泛型 K 推断）
 * - component 分支：根据传入组件推导 props
 */
export type AutoFormFactoryMethod<
  TControls extends AutoFormControls,
  TResult,
  TDefaultKey extends string,
  TExtraArgs extends unknown[] = []
> = {
  (...args: [...TExtraArgs, string?]): TResult
  <K extends ControlKey<TControls>>(...args: [...TExtraArgs, MetaByControlKey<TControls, K>]): TResult
  (...args: [...TExtraArgs, MetaByDefaultIfExists<TControls, TDefaultKey>]): TResult
  <C extends IsComponent>(
    ...args: [...TExtraArgs, MetaByComponent<C>]
  ): TResult
}

/**
 * 类型化的 Zod 工厂接口（轻量版）
 * @template TControls - 合并后的控件注册表
 */
export interface TypedZodFactory<TControls extends AutoFormControls> {
  /** 字符串类型工厂 */
  string: AutoFormFactoryMethod<TControls, z.ZodString, 'string'>

  /** 数字类型工厂 */
  number: AutoFormFactoryMethod<TControls, z.ZodNumber, 'number'>

  /** 布尔类型工厂 */
  boolean: AutoFormFactoryMethod<TControls, z.ZodBoolean, 'boolean'>

  /** 文件类型工厂 */
  file: AutoFormFactoryMethod<TControls, z.ZodType<File>, 'file'>

  /** 电子邮件验证工厂 */
  email: AutoFormFactoryMethod<TControls, z.ZodString, 'string'>

  /** URL 验证工厂 */
  url: AutoFormFactoryMethod<TControls, z.ZodString, 'string'>

  /** UUID 验证工厂 */
  uuid: AutoFormFactoryMethod<TControls, z.ZodString, 'string'>

  /**
   * 枚举类型工厂 - 支持字符串数组或枚举对象
   */
  enum: {
    <K extends ControlKey<TControls>>(values: [], overwrite?: MetaByControlKey<TControls, K>): z.ZodString
    (values: [], overwrite: MetaByDefaultIfExists<TControls, 'enum'>): z.ZodString
    <C extends IsComponent>(values: [], overwrite: MetaByComponent<C>): z.ZodString

    <const T extends readonly [string, ...string[]], K extends ControlKey<TControls>>(values: T, overwrite?: MetaByControlKey<TControls, K>): z.ZodEnum<z.core.util.ToEnum<T[number]>>
    <const T extends readonly [string, ...string[]]>(values: T, overwrite: MetaByDefaultIfExists<TControls, 'enum'>): z.ZodEnum<z.core.util.ToEnum<T[number]>>
    <const T extends readonly [string, ...string[]], C extends IsComponent>(values: T, overwrite: MetaByComponent<C>): z.ZodEnum<z.core.util.ToEnum<T[number]>>

    <const T extends z.core.util.EnumLike, K extends ControlKey<TControls>>(values: T, overwrite?: MetaByControlKey<TControls, K>): z.ZodEnum<T>
    <const T extends z.core.util.EnumLike>(values: T, overwrite: MetaByDefaultIfExists<TControls, 'enum'>): z.ZodEnum<T>
    <const T extends z.core.util.EnumLike, C extends IsComponent>(values: T, overwrite: MetaByComponent<C>): z.ZodEnum<T>
  }

  /**
   * 日期类型工厂 - 用于 DatePicker/Calendar
   * 支持 CalendarDate、DateRange、CalendarDate[]
   * @template T - 日期值类型（默认 CalendarDate）
   */
  calendarDate: {
    <T extends DateValue | DateRange | DateValue[] = CalendarDate, K extends ControlKey<TControls> = never>(
      meta?: MetaByControlKey<TControls, K>
    ): z.ZodType<T>
    <T extends DateValue | DateRange | DateValue[] = CalendarDate>(
      meta: MetaByDefaultIfExists<TControls, 'calendarDate'>
    ): z.ZodType<T>
    <C extends IsComponent, T extends DateValue | DateRange | DateValue[] = CalendarDate>(
      meta: MetaByComponent<C>
    ): z.ZodType<T>
  }

  /**
   * 输入日期工厂 - 用于 UInputDate 组件
   * 返回 CalendarDate 类型
   */
  inputDate: AutoFormFactoryMethod<TControls, z.ZodType<CalendarDate>, 'inputDate'>

  /**
   * 输入时间工厂 - 用于 UInputTime 组件
   * 返回 Time 类型
   */
  inputTime: AutoFormFactoryMethod<TControls, z.ZodType<Time>, 'inputTime'>

  /**
   * ISO 日期时间字符串工厂
   * 验证 ISO 8601 格式(如 "2025-12-01T06:15:00Z")
   */
  isoDatetime: AutoFormFactoryMethod<TControls, z.ZodType<string>, 'string'>

  /**
   * ISO 日期字符串工厂
   * 验证 YYYY-MM-DD 格式(如 "2025-12-01")
   */
  isoDate: AutoFormFactoryMethod<TControls, z.ZodType<string>, 'string'>

  /**
   * ISO 时间字符串工厂
   * 验证 HH:MM[:SS[.s+]] 格式(如 "14:30:00")
   */
  isoTime: AutoFormFactoryMethod<TControls, z.ZodType<string>, 'string'>

  /**
   * 数组类型工厂
   * @template T - 数组元素的 Zod 类型
   */
  array: {
    <T extends z.ZodType, K extends ControlKey<TControls>>(schema: T, overwrite?: MetaByControlKey<TControls, K>): z.ZodArray<T>
    <T extends z.ZodType>(schema: T, overwrite: MetaByDefaultIfExists<TControls, 'array'>): z.ZodArray<T>
    <T extends z.ZodType, C extends IsComponent>(schema: T, overwrite: MetaByComponent<C>): z.ZodArray<T>
  }

  /**
   * 元组类型工厂
   * @template T - 元组元素的 Zod 类型数组
   */
  tuple: {
    <T extends readonly [z.ZodType, ...z.ZodType[]], K extends ControlKey<TControls>>(
      schemas: T,
      overwrite?: MetaByControlKey<TControls, K>
    ): z.ZodTuple<T>
    <T extends readonly [z.ZodType, ...z.ZodType[]]>(
      schemas: T,
      overwrite: MetaByDefaultIfExists<TControls, 'tuple'>
    ): z.ZodTuple<T>
    <T extends readonly [z.ZodType, ...z.ZodType[]], C extends IsComponent>(
      schemas: T,
      overwrite: MetaByComponent<C>
    ): z.ZodTuple<T>
  }

  /**
   * 布局工厂 - 创建表单布局容器
   * @template C - 布局组件类型
   * @template Fields - 布局内字段定义
   * @returns 布局标记类型（运行时为 ZodCustom）
   */
  layout: <C extends IsComponent = IsComponent, Fields extends Record<string, z.ZodType> = Record<string, z.ZodType>>(
    config: Omit<AutoFormLayoutConfig<C>, 'fields'> & { fields: Fields }
  ) => LayoutFieldMarker<Fields>

  /**
   * 对象工厂 - 支持柯里化和直接调用
   */
  object: {
    <T extends object>(): ObjectFactoryCurried<TControls, T, z.core.$strip, 'object'>
  } & ObjectFactoryDirect<TControls, z.core.$strip, 'object'>

  /**
   * 松散对象工厂 - 允许额外属性
   */
  looseObject: {
    <T extends object>(): ObjectFactoryCurried<TControls, T, z.core.$loose, 'looseObject'>
  } & ObjectFactoryDirect<TControls, z.core.$loose, 'looseObject'>

  /**
   * 严格对象工厂 - 禁止额外属性
   */
  strictObject: {
    <T extends object>(): ObjectFactoryCurried<TControls, T, z.core.$strict, 'strictObject'>
  } & ObjectFactoryDirect<TControls, z.core.$strict, 'strictObject'>
}
