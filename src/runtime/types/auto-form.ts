import type { OmitByKey } from '@movk/core'
import type { CollapsibleRootProps } from 'reka-ui'
import type { ClassNameValue } from 'tailwind-merge'
import type { GlobalMeta, z } from 'zod/v4'
import type { ArrayFieldKeys, ComponentProps, ComponentSlots, IsComponent, NonObjectFieldKeys, ObjectFieldKeys, ReactiveValue, Suggest } from '../core'
import type { FormError } from '@nuxt/ui'
import type { AUTOFORM_META } from '../constants/auto-form'
import type { CalendarDate } from '@internationalized/date'

// ============================================================================
// 基础上下文类型
// ============================================================================

/**
 * 表单字段上下文 - 提供字段级别的运行时信息
 * @template S - 表单 State 类型
 * @description
 * - open: 折叠状态，仅在嵌套字段（object/array）中存在
 * - count: 数组元素计数，仅在数组字段中存在
 */
export interface AutoFormFieldContext<S = any> {
  /** 表单数据 - 使用 getter 确保获取最新值 */
  readonly state: S
  /** 字段路径（点分隔符格式，如 "user.profile.name"） */
  readonly path: string
  /** 字段当前值 - 使用 getter 确保获取最新值 */
  readonly value: S[keyof S]
  /** 设置字段值的回调函数 */
  setValue: (value: S[keyof S]) => void
  /** 表单错误列表（包含字段级和表单级错误） */
  readonly errors: unknown[]
  /** 表单提交加载状态 */
  readonly loading: boolean
  /** 折叠状态（仅适用于嵌套字段和数组字段） */
  readonly open?: boolean
  /** 数组元素计数（仅适用于数组字段） */
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

// ============================================================================
// 动态插槽类型
// ============================================================================

type DynamicFieldSlotKeys = keyof AutoFormFieldSlots
type DynamicFieldNestedSlotKeys = 'content'

/**
 * 根据插槽类型提取对应的额外参数
 * @template SlotType - 插槽类型键
 */
type SlotTypeExtraProps<SlotType extends DynamicFieldSlotKeys>
  = SlotType extends 'label' ? { label?: string }
    : SlotType extends 'hint' ? { hint?: string }
      : SlotType extends 'description' ? { description?: string }
        : SlotType extends 'help' ? { help?: string }
          : SlotType extends 'error' ? { error?: boolean | string }
            : SlotType extends 'default' ? { error?: boolean | string }
              : {}

/**
 * 动态表单插槽类型 - 支持字段级插槽自定义
 * @template T - 表单数据类型
 *
 * 支持三种插槽命名模式：
 * 1. 通用插槽：任意字符串键
 * 2. 字段类型插槽：`field-{slotType}` 或 `field-{slotType}:{fieldKey}` - 根据 slotType 自动添加额外参数
 * 3. 嵌套内容插槽：`field-content:{objectKey}` 或 `field-content:{arrayKey}`
 */
export type DynamicFormSlots<T>
  = Record<string, (props: AutoFormFieldContext<T>) => unknown>
    & {
      [K in DynamicFieldSlotKeys as `field-${K}`]: (
        props: SlotTypeExtraProps<K> & AutoFormFieldContext<T>
      ) => unknown
    }
    & {
      [K in DynamicFieldSlotKeys as `field-${K}:${NonObjectFieldKeys<T>}`]: (
        props: SlotTypeExtraProps<K> & AutoFormFieldContext<T>
      ) => unknown
    }
    & {
      [K in DynamicFieldSlotKeys as `field-${K}:${ObjectFieldKeys<T>}`]: (
        props: SlotTypeExtraProps<K> & AutoFormFieldContext<T>
      ) => unknown
    }
    & Record<`field-${DynamicFieldNestedSlotKeys}:${ObjectFieldKeys<T>}`, (props: AutoFormFieldContext<T>) => unknown>
    & Record<`field-${DynamicFieldNestedSlotKeys}:${ArrayFieldKeys<T>}`, (props: AutoFormFieldContext<T>) => unknown>

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

// ============================================================================
// 控件元数据类型
// ============================================================================

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

/**
 * 控件实例配置 - 运行时使用的简化版本
 * @template C - 组件类型
 */
export interface AutoFormControl<C extends IsComponent = IsComponent> {
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
export type AutoFormControls = Record<string, AutoFormControl>

// ============================================================================
// 布局配置类型
// ============================================================================

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
export type AutoFormMergeMeta = GlobalMeta
  & AutoFormControlsMeta
  & {
    /** 已映射的控件实例（运行时生成） */
    mapped?: AutoFormControl
    /** 布局配置 */
    layout?: AutoFormLayoutConfig
    /** 覆写元数据（优先级最高） */
    overwrite?: AutoFormControlsMeta
  }

// ============================================================================
// 字段配置类型
// ============================================================================

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

// ============================================================================
// 嵌套折叠配置
// ============================================================================

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

// ============================================================================
// 类型工具
// ============================================================================

/**
 * 提取对象的已知键（剔除索引签名）
 * @template T - 源对象类型
 */
type KnownKeys<T> = {
  [K in keyof T]-?: string extends K
    ? never
    : number extends K
      ? never
      : symbol extends K
        ? never
        : K
}[keyof T]

type KeysOf<T> = Extract<keyof T, string>

/**
 * 提取控件类型键的简化类型
 * @template TControls - 控件注册表类型
 */
type ControlTypeKey<TControls> = KnownKeys<TControls> & keyof TControls & string

/**
 * 排除 component 和 type 的控件元数据
 * @template T - 组件类型
 */
type OmitControlMeta<T extends IsComponent> = OmitByKey<AutoFormControlsMeta<T>, 'component' | 'type'>

/**
 * 根据控件类型键获取对应的元数据类型
 * @template TControls - 控件注册表类型
 * @template K - 控件类型键
 */
type MetaByType<TControls, K extends keyof TControls>
  = TControls[K] extends AutoFormControl<infer C>
    ? OmitControlMeta<C>
    : OmitControlMeta<IsComponent>

/**
 * 根据 Zod 类型字符串获取对应的元数据类型
 * @template TControls - 控件注册表类型
 * @template TZod - Zod 类型名称
 */
type MetaByZod<TControls, TZod extends string>
  = TZod extends KnownKeys<TControls>
    ? TControls[TZod] extends AutoFormControl<infer C>
      ? OmitControlMeta<C>
      : OmitControlMeta<IsComponent>
    : OmitControlMeta<IsComponent>

/**
 * 联合类型转交叉类型
 * @template U - 联合类型
 * @description 此类型可能导致大型联合类型的性能问题，建议限制联合成员数量
 */
type UnionToIntersection<U> = (U extends unknown ? (k: U) => void : never) extends ((k: infer I) => void) ? I : never

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
 * 递归展开布局字段 - 移除布局标记并合并 fields
 * @template S - Shape 类型
 * @template Depth - 当前递归深度（内部使用）
 * @description 递归深度限制为 5 层，超过后将停止展开并保留原类型
 */
type ExtractLayoutShape<
  S extends Record<string, any>,
  Depth extends number[] = []
> = Depth['length'] extends 5
  ? S // 达到最大深度，直接返回原类型
  : {
    [K in keyof S as S[K] extends LayoutFieldMarker<any> ? never : K]: S[K]
  } & UnionToIntersection<
    {
      [K in keyof S]: S[K] extends LayoutFieldMarker<infer F>
        ? ExtractLayoutShape<F, [...Depth, 1]> // 增加深度计数
        : {}
    }[keyof S]
  >

/**
 * 合并默认控件和自定义控件
 * @template TControls - 自定义控件
 * @template DFTC - 默认控件
 */
type WithDefaultControls<TControls, DFTC> = TControls & DFTC

// ============================================================================
// 对象工厂辅助类型
// ============================================================================

/**
 * 对象工厂元数据类型 - 基础元数据
 */
type ObjectMetaBase<TC extends AutoFormControls, DFTC extends AutoFormControls>
  = { component?: never, type?: never } & MetaByZod<WithDefaultControls<TC, DFTC>, 'object'>

/**
 * 对象工厂元数据类型 - 带 type
 */
type ObjectMetaWithType<TC extends AutoFormControls, DFTC extends AutoFormControls, K extends ControlTypeKey<WithDefaultControls<TC, DFTC>>>
  = { type: Suggest<K>, component?: never } & MetaByType<WithDefaultControls<TC, DFTC>, K>

/**
 * 对象工厂元数据类型 - 带 component
 */
type ObjectMetaWithComponent<C extends IsComponent>
  = { component: C, type?: never } & OmitControlMeta<C>

/**
 * 对象工厂柯里化签名
 */
type ObjectFactoryCurried<
  TC extends AutoFormControls,
  DFTC extends AutoFormControls,
  T extends object,
  Mode extends z.core.$strip | z.core.$loose | z.core.$strict
> = {
  <S extends Record<string, any>>(
    shape: S & Partial<Record<KeysOf<T>, any>>,
    meta?: ObjectMetaBase<TC, DFTC>
  ): z.ZodObject<ExtractLayoutShape<S>, Mode>
  <S extends Record<string, any>, K extends ControlTypeKey<WithDefaultControls<TC, DFTC>>>(
    shape: S & Partial<Record<KeysOf<T>, any>>,
    meta?: ObjectMetaWithType<TC, DFTC, K>
  ): z.ZodObject<ExtractLayoutShape<S>, Mode>
  <S extends Record<string, any>, C extends IsComponent>(
    shape: S & Partial<Record<KeysOf<T>, any>>,
    meta?: ObjectMetaWithComponent<C>
  ): z.ZodObject<ExtractLayoutShape<S>, Mode>
}

/**
 * 对象工厂直接调用签名
 */
type ObjectFactoryDirect<
  TC extends AutoFormControls,
  DFTC extends AutoFormControls,
  Mode extends z.core.$strip | z.core.$loose | z.core.$strict
> = {
  <S extends Record<string, any>>(
    shape: S,
    meta?: ObjectMetaBase<TC, DFTC>
  ): z.ZodObject<ExtractLayoutShape<S>, Mode>
  <S extends Record<string, any>, K extends ControlTypeKey<WithDefaultControls<TC, DFTC>>>(
    shape: S,
    meta?: ObjectMetaWithType<TC, DFTC, K>
  ): z.ZodObject<ExtractLayoutShape<S>, Mode>
  <S extends Record<string, any>, C extends IsComponent>(
    shape: S,
    meta?: ObjectMetaWithComponent<C>
  ): z.ZodObject<ExtractLayoutShape<S>, Mode>
}

// ============================================================================
// 工厂方法类型
// ============================================================================

/**
 * 基础工厂方法类型 - 支持多种调用方式
 * @template TControls - 控件注册表
 * @template TZod - Zod 类型名称
 * @template TResult - 返回类型
 * @template TExtraParams - 额外参数（如数组的元素 schema）
 *
 * 支持四种调用方式：
 * 1. 传入错误消息字符串
 * 2. 传入基础元数据对象
 * 3. 传入带 type 的元数据（指定控件类型）
 * 4. 传入带 component 的元数据（直接指定组件）
 */
export type AutoFormFactoryMethod<
  TControls,
  TZod extends string,
  TResult,
  TExtraParams extends unknown[] = []
> = {
  /** 调用方式 1: 仅传入错误消息或额外参数 */
  (...args: [...TExtraParams, string?]): TResult

  /** 调用方式 2: 传入基础元数据（不指定 type 或 component） */
  (...args: [...TExtraParams, ({ component?: never, type?: never } & MetaByZod<TControls, TZod>)?]): TResult

  /** 调用方式 3: 传入带 type 的元数据 */
  <K extends ControlTypeKey<TControls>>(
    ...args: [...TExtraParams, ({ type: Suggest<K>, component?: never } & MetaByType<TControls, K>)?]
  ): TResult

  /** 调用方式 4: 传入带 component 的元数据 */
  <C extends IsComponent>(
    ...args: [...TExtraParams, ({ component: C, type?: never } & OmitControlMeta<C>)?]
  ): TResult
}

// ============================================================================
// 类型化 Zod 工厂接口
// ============================================================================

/**
 * 类型化的 Zod 工厂接口 - 提供类型安全的 schema 构建方法
 * @template TC - 自定义控件注册表
 * @template DFTC - 默认控件注册表
 *
 * @description 此接口提供了一套类型安全的 API 来构建 Zod schema，
 * 支持自动推导控件类型和元数据，并与 AutoForm 无缝集成
 */
export interface TypedZodFactory<TC extends AutoFormControls, DFTC extends AutoFormControls> {
  // --------------------------------------------------------------------------
  // 基础类型工厂
  // --------------------------------------------------------------------------

  /** 字符串类型工厂 */
  string: AutoFormFactoryMethod<WithDefaultControls<TC, DFTC>, 'string', z.ZodString>

  /** 数字类型工厂 */
  number: AutoFormFactoryMethod<WithDefaultControls<TC, DFTC>, 'number', z.ZodNumber>

  /** 布尔类型工厂 */
  boolean: AutoFormFactoryMethod<WithDefaultControls<TC, DFTC>, 'boolean', z.ZodBoolean>

  /** 文件类型工厂 */
  file: AutoFormFactoryMethod<WithDefaultControls<TC, DFTC>, 'file', z.ZodType<File>>

  // --------------------------------------------------------------------------
  // Zod v4 专用验证工厂
  // --------------------------------------------------------------------------

  /** 电子邮件验证工厂 */
  email: AutoFormFactoryMethod<WithDefaultControls<TC, DFTC>, 'string', z.ZodString>

  /** URL 验证工厂 */
  url: AutoFormFactoryMethod<WithDefaultControls<TC, DFTC>, 'string', z.ZodString>

  /** UUID 验证工厂 */
  uuid: AutoFormFactoryMethod<WithDefaultControls<TC, DFTC>, 'string', z.ZodString>

  // --------------------------------------------------------------------------
  // 枚举工厂
  // --------------------------------------------------------------------------

  /**
   * 枚举类型工厂 - 支持字符串数组或枚举对象
   * @description 重载顺序：空数组 > 字符串数组 > 枚举对象
   */
  enum: {
    // 空数组重载（最高优先级）- 返回 ZodString 支持运行时动态值
    (
      values: [],
      overwrite?: MetaByZod<WithDefaultControls<TC, DFTC>, 'enum'>
    ): z.ZodString
    <K extends ControlTypeKey<WithDefaultControls<TC, DFTC>>>(
      values: [],
      overwrite?: { type: Suggest<K>, component?: never } & MetaByType<WithDefaultControls<TC, DFTC>, K>
    ): z.ZodString
    <C extends IsComponent>(
      values: [],
      overwrite?: { component: C, type?: never } & OmitControlMeta<C>
    ): z.ZodString

    // 字符串数组重载
    <const T extends ReadonlyArray<string>>(
      values: T,
      overwrite?: MetaByZod<WithDefaultControls<TC, DFTC>, 'enum'>
    ): z.ZodEnum<z.core.util.ToEnum<T[number]>>
    <const T extends ReadonlyArray<string>, K extends ControlTypeKey<WithDefaultControls<TC, DFTC>>>(
      values: T,
      overwrite?: { type: Suggest<K>, component?: never } & MetaByType<WithDefaultControls<TC, DFTC>, K>
    ): z.ZodEnum<z.core.util.ToEnum<T[number]>>
    <const T extends ReadonlyArray<string>, C extends IsComponent>(
      values: T,
      overwrite?: { component: C, type?: never } & OmitControlMeta<C>
    ): z.ZodEnum<z.core.util.ToEnum<T[number]>>

    // 枚举对象重载
    <const T extends z.core.util.EnumLike>(
      values: T,
      overwrite?: MetaByZod<WithDefaultControls<TC, DFTC>, 'enum'>
    ): z.ZodEnum<T>
    <const T extends z.core.util.EnumLike, K extends ControlTypeKey<WithDefaultControls<TC, DFTC>>>(
      values: T,
      overwrite?: { type: Suggest<K>, component?: never } & MetaByType<WithDefaultControls<TC, DFTC>, K>
    ): z.ZodEnum<T>
    <const T extends z.core.util.EnumLike, C extends IsComponent>(
      values: T,
      overwrite?: { component: C, type?: never } & OmitControlMeta<C>
    ): z.ZodEnum<T>
  }

  // --------------------------------------------------------------------------
  // 日期工厂
  // --------------------------------------------------------------------------

  /**
   * 日期类型工厂 - 默认返回 CalendarDate 类型
   * @template T - 日期值类型（默认 CalendarDate）
   */
  date: {
    <T = CalendarDate>(meta?: ({ component?: never, type?: never } & MetaByZod<WithDefaultControls<TC, DFTC>, 'date'>)): z.ZodType<T>
    <K extends ControlTypeKey<WithDefaultControls<TC, DFTC>>, T = CalendarDate>(
      meta?: { type: Suggest<K>, component?: never } & MetaByType<WithDefaultControls<TC, DFTC>, K>
    ): z.ZodType<T>
    <C extends IsComponent, T = CalendarDate>(
      meta?: { component: C, type?: never } & OmitControlMeta<C>
    ): z.ZodType<T>
  }

  // --------------------------------------------------------------------------
  // 集合类型工厂
  // --------------------------------------------------------------------------

  /**
   * 数组类型工厂
   * @template T - 数组元素的 Zod 类型
   */
  array: {
    <T extends z.ZodType>(schema: T, overwrite?: never): z.ZodArray<T>
    <T extends z.ZodType, K extends ControlTypeKey<WithDefaultControls<TC, DFTC>>>(
      schema: T, overwrite?: { type: Suggest<K>, component?: never } & MetaByType<WithDefaultControls<TC, DFTC>, K>
    ): z.ZodArray<T>
    <T extends z.ZodType, C extends IsComponent>(
      schema: T, overwrite?: { component: C, type?: never } & OmitControlMeta<C>
    ): z.ZodArray<T>
  }

  /**
   * 元组类型工厂
   * @template T - 元组元素的 Zod 类型数组
   */
  tuple: {
    <T extends readonly [z.ZodType, ...z.ZodType[]]>(schemas: T, overwrite?: never): z.ZodTuple<T>
    <T extends readonly [z.ZodType, ...z.ZodType[]], K extends ControlTypeKey<WithDefaultControls<TC, DFTC>>>(
      schemas: T, overwrite?: { type: Suggest<K>, component?: never } & MetaByType<WithDefaultControls<TC, DFTC>, K>
    ): z.ZodTuple<T>
    <T extends readonly [z.ZodType, ...z.ZodType[]], C extends IsComponent>(
      schemas: T, overwrite?: { component: C, type?: never } & OmitControlMeta<C>
    ): z.ZodTuple<T>
  }

  // --------------------------------------------------------------------------
  // 布局和对象工厂
  // --------------------------------------------------------------------------

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
   * @description
   * - 柯里化: afz.object<State>()({ name: afz.string() }, { type: 'input' })
   * - 直接调用: afz.object({ name: afz.string() }, { type: 'input' })
   */
  object: {
    <T extends object>(): ObjectFactoryCurried<TC, DFTC, T, z.core.$strip>
    <S extends Record<string, any>>(shape: S, meta?: ObjectMetaBase<TC, DFTC>): z.ZodObject<ExtractLayoutShape<S>, z.core.$strip>
    <S extends Record<string, any>, K extends ControlTypeKey<WithDefaultControls<TC, DFTC>>>(
      shape: S,
      meta?: ObjectMetaWithType<TC, DFTC, K>
    ): z.ZodObject<ExtractLayoutShape<S>, z.core.$strip>
    <S extends Record<string, any>, C extends IsComponent>(
      shape: S,
      meta?: ObjectMetaWithComponent<C>
    ): z.ZodObject<ExtractLayoutShape<S>, z.core.$strip>
  } & ObjectFactoryDirect<TC, DFTC, z.core.$strip>

  /**
   * 松散对象工厂 - 允许额外属性
   */
  looseObject: {
    <T extends object>(): ObjectFactoryCurried<TC, DFTC, T, z.core.$loose>
    <S extends Record<string, any>>(shape: S, meta?: ObjectMetaBase<TC, DFTC>): z.ZodObject<ExtractLayoutShape<S>, z.core.$loose>
    <S extends Record<string, any>, K extends ControlTypeKey<WithDefaultControls<TC, DFTC>>>(
      shape: S,
      meta?: ObjectMetaWithType<TC, DFTC, K>
    ): z.ZodObject<ExtractLayoutShape<S>, z.core.$loose>
    <S extends Record<string, any>, C extends IsComponent>(
      shape: S,
      meta?: ObjectMetaWithComponent<C>
    ): z.ZodObject<ExtractLayoutShape<S>, z.core.$loose>
  } & ObjectFactoryDirect<TC, DFTC, z.core.$loose>

  /**
   * 严格对象工厂 - 禁止额外属性
   */
  strictObject: {
    <T extends object>(): ObjectFactoryCurried<TC, DFTC, T, z.core.$strict>
    <S extends Record<string, any>>(shape: S, meta?: ObjectMetaBase<TC, DFTC>): z.ZodObject<ExtractLayoutShape<S>, z.core.$strict>
    <S extends Record<string, any>, K extends ControlTypeKey<WithDefaultControls<TC, DFTC>>>(
      shape: S,
      meta?: ObjectMetaWithType<TC, DFTC, K>
    ): z.ZodObject<ExtractLayoutShape<S>, z.core.$strict>
    <S extends Record<string, any>, C extends IsComponent>(
      shape: S,
      meta?: ObjectMetaWithComponent<C>
    ): z.ZodObject<ExtractLayoutShape<S>, z.core.$strict>
  } & ObjectFactoryDirect<TC, DFTC, z.core.$strict>
}
