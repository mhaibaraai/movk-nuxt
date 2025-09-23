import type { GetItemKeys } from '#ui/types/utils'
import type { OmitByKey } from '@movk/core'
import type { IconProps } from '@nuxt/ui'
import type { ClassNameValue } from 'tailwind-merge'
import type { GlobalMeta, z } from 'zod/v4'
import type { ComponentProps, ComponentSlots, IsComponent, ReactiveValue, Suggest } from '../core'

type DynamicFieldSlotKeys = 'default' | 'label' | 'description' | 'hint' | 'help' | 'error'

/** 支持嵌套对象路径的插槽类型 */
type NestedPathSlots<T> = T extends object
  ? {
      [K in keyof T as K extends string
        ? `${DynamicFieldSlotKeys}:${K}` | (T[K] extends object
          ? `${DynamicFieldSlotKeys}:${K}.${Extract<keyof T[K], string>}`
          : never)
        : never
      ]: (props: AutoFormFieldContext<T>) => any
    }
  : Record<string, never>

export type DynamicFormSlots<T>
  = Record<string, (props: AutoFormFieldContext<T>) => any>
    & Record<`${DynamicFieldSlotKeys}`, (props: AutoFormFieldContext<T>) => any>
    & Record<`${DynamicFieldSlotKeys}:${keyof T extends string ? keyof T : never}`, (props: AutoFormFieldContext<T>) => any>
    & NestedPathSlots<T>

export interface AutoFormFieldContext<S = any> {
  /** 表单数据 - 使用 getter 确保获取最新值 */
  readonly state: S
  /** 字段路径 */
  readonly path: string
  /** 字段值 - 使用 getter 确保获取最新值 */
  readonly value: S[keyof S]
  /** 设置字段值 */
  setValue: (value: S[keyof S]) => void
}

/**
 * 控件元数据（统一模型）- 支持响应式
 */
export interface AutoFormControlsMeta<C extends IsComponent = IsComponent> {
  /** 控件类型（注册键名） */
  type?: string
  /** 控件组件（直传组件时使用） */
  component?: C
  /** 控件属性 */
  controlProps?: ReactiveValue<ComponentProps<C>, AutoFormFieldContext>
  /** 控件插槽（调用侧可部分覆盖） */
  controlSlots?: ReactiveValue<Partial<ComponentSlots<C>>, AutoFormFieldContext>
}

export interface AutoFormControl<C extends IsComponent = IsComponent> {
  component: C
  controlProps?: ComponentProps<C>
  controlSlots?: Partial<ComponentSlots<C>>
}

export interface AutoFormControls {
  [key: string]: AutoFormControl
}

export interface AutoFormField {
  /** 字段路径 */
  path: string
  /** 字段原始 schema */
  schema: z.ZodType
  /** 字段原始 schema（未处理装饰器） */
  originalSchema: z.ZodType
  /** 字段元数据 */
  meta: GlobalMeta & AutoFormControlsMeta & { mapped?: AutoFormControl }
  /** 字段装饰器信息 */
  decorators: {
    isOptional: boolean
    defaultValue?: any
    description?: string
  }
  /** 子字段（仅对象类型有效） */
  children?: AutoFormField[]
}

/** 提取对象的“已知键”（剔除 string/number/symbol 索引） */
type KnownKeys<T> = {
  [K in keyof T]-?: string extends K
    ? never
    : number extends K
      ? never
      : symbol extends K
        ? never
        : K
}[keyof T]

type OmitControlMeta<T extends IsComponent> = OmitByKey<AutoFormControlsMeta<T>, 'component' | 'type'>

type MetaByType<TControls, K extends keyof TControls>
  = TControls[K] extends AutoFormControl<infer C>
    ? OmitControlMeta<C>
    : OmitControlMeta<IsComponent>

type MetaByZod<TControls, TZod extends string>
  = TZod extends KnownKeys<TControls>
    ? TControls[TZod] extends AutoFormControl<infer C>
      ? OmitControlMeta<C>
      : OmitControlMeta<IsComponent>
    : OmitControlMeta<IsComponent>

export type AutoFormFactoryMethod<
  TControls,
  TZod extends string,
  TResult,
  TExtraParams extends any[] = [],
> = {
  (...args: [...TExtraParams, ({ component?: never, type?: never } & MetaByZod<TControls, TZod>)?]): TResult
} & {
  <K extends KnownKeys<TControls> & keyof TControls & string>(
    ...args: [...TExtraParams, ({ type: Suggest<K>, component?: never } & MetaByType<TControls, K>)?]
  ): TResult
} & {
  <C extends IsComponent>(
    ...args: [...TExtraParams, ({ component: C, type?: never } & OmitControlMeta<C>)?]
  ): TResult
}

export interface AutoFormAccordionItem {
  label?: string
  /**
   * @IconifyIcon
   */
  icon?: IconProps['name']
  /**
   * @IconifyIcon
   */
  trailingIcon?: IconProps['name']
  slot?: string
  content?: string
  /** A unique value for the accordion item. Defaults to the index. */
  value?: string
  disabled?: boolean
  class?: any
  ui?: { root?: ClassNameValue, item?: ClassNameValue, header?: ClassNameValue, trigger?: ClassNameValue, content?: ClassNameValue, body?: ClassNameValue, leadingIcon?: ClassNameValue, trailingIcon?: ClassNameValue, label?: ClassNameValue }

  field?: AutoFormField
  [key: string]: any
}

type AutoFormAccordionSlotProps<T extends AutoFormAccordionItem> = (props: {
  /** 当前 item 数据 */
  item: T
  /** 当前 item 索引 */
  index: number
  /** 是否展开状态 */
  open: boolean
  /** 关联的表单字段（由 generateAccordionItems 注入） */
  field?: AutoFormField
}) => any

export interface AutoFormAccordionSlots<T extends AutoFormAccordionItem = AutoFormAccordionItem> {
  leading: AutoFormAccordionSlotProps<T>
  default: AutoFormAccordionSlotProps<T>
  trailing: AutoFormAccordionSlotProps<T>
  content: AutoFormAccordionSlotProps<T>
  body: AutoFormAccordionSlotProps<T>
}

export interface AutoFormAccordionProps<T extends AutoFormAccordionItem = AutoFormAccordionItem> {
  /**
   * The element or component this component should render as.
   * @defaultValue 'div'
   */
  as?: any
  items?: T[]
  /**
   * The icon displayed on the right side of the trigger.
   * @defaultValue appConfig.ui.icons.chevronDown
   * @IconifyIcon
   */
  trailingIcon?: IconProps['name']
  /**
   * The key used to get the label from the item.
   * @defaultValue 'label'
   */
  labelKey?: GetItemKeys<T>
  class?: any
}

/** UAccordion 配置接口 */
export interface AccordionConfig<S extends object = object, T extends AutoFormAccordionItem = AutoFormAccordionItem> {
  /**
   * 是否启用 UAccordion 包装
   * @default false
   */
  enabled?: boolean
  props?: AutoFormAccordionProps<T>
  /**
   * 自定义 accordion item 生成函数
   * @param field 字段
   * @returns AutoFormAccordionItem
   */
  itemGenerator?: (field: AutoFormField) => T
  /**
   * 字段级覆盖配置
   */
  fieldOverrides?: Record<keyof S, Partial<T>>
  /**
   * 是否只对包含对象字段的表单启用
   * @default true
   * @example
   * // true: 只有包含 object/array 等嵌套字段时才启用折叠面板
   * // false: 无论表单结构如何都启用折叠面板
   * onlyForObjectFields: false
   */
  onlyForObjectFields?: boolean
}
