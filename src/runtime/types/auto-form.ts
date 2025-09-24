import type { OmitByKey } from '@movk/core'
import type { IconProps } from '@nuxt/ui'
import type { GetItemKeys } from '@nuxt/ui/runtime/types/utils.js'
import type { AccordionRootProps } from 'reka-ui'
import type { ClassNameValue } from 'tailwind-merge'
import type { GlobalMeta, z } from 'zod/v4'
import type { ComponentProps, ComponentSlots, IsComponent, IsPlainObject, NestedKeys, ReactiveValue, Suggest } from '../core'

type DynamicFieldSlotKeys = 'default' | 'label' | 'description' | 'hint' | 'help' | 'error'
type AccordionSlotKeys = 'default' | 'leading' | 'trailing' | 'content' | 'body'

/** 提取对象字段的所有路径（包括嵌套） */
type ObjectFieldPaths<T, D extends number = 2> = [D] extends [never]
  ? never
  : {
      [K in keyof T & string]: IsPlainObject<T[K]> extends true
        ? K | `${K}.${ObjectFieldPaths<T[K], [never, 0, 1, 2, 3, 4][D]>}`
        : never
    }[keyof T & string]

/** 提取非对象字段的所有路径（叶子节点） */
type LeafFieldPaths<T, D extends number = 2> = [D] extends [never]
  ? never
  : {
      [K in keyof T & string]: IsPlainObject<T[K]> extends true
        ? `${K}.${LeafFieldPaths<T[K], [never, 0, 1, 2, 3, 4][D]>}`
        : K
    }[keyof T & string]

export type DynamicFormSlots<T>
  = Record<string, (props: AutoFormFieldContext<T>) => any>
    & Record<`${DynamicFieldSlotKeys}`, (props: AutoFormFieldContext<T>) => any>
    & Record<`${DynamicFieldSlotKeys}:${LeafFieldPaths<T>}`, (props: AutoFormFieldContext<T>) => any>
    // 新增：UAccordion 插槽支持 - 仅适用于对象字段
    & Record<`accordion-${AccordionSlotKeys}`, (props: { field: AutoFormField, item: any } & Record<string, any>) => any>
    & Record<`accordion-${AccordionSlotKeys}:${ObjectFieldPaths<T>}`, (props: { field: AutoFormField, item: any } & Record<string, any>) => any>

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
  /** 字段级accordion配置 */
  accordion?: ReactiveValue<Partial<AutoFormAccordionProps>, AutoFormFieldContext>
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
  ui?: { item?: ClassNameValue, header?: ClassNameValue, trigger?: ClassNameValue, leadingIcon?: ClassNameValue, label?: ClassNameValue, trailingIcon?: ClassNameValue, content?: ClassNameValue, body?: ClassNameValue }
  [key: string]: any
}

export interface AutoFormAccordionProps<T extends AutoFormAccordionItem = AutoFormAccordionItem> extends Pick<AccordionRootProps, 'collapsible' | 'defaultValue' | 'modelValue' | 'type' | 'disabled' | 'unmountOnHide'> {
  /**
   * 是否启用 UAccordion 包装
   * @default true
   */
  enabled?: boolean
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
  ui?: { root?: ClassNameValue, item?: ClassNameValue, header?: ClassNameValue, trigger?: ClassNameValue, content?: ClassNameValue, body?: ClassNameValue, leadingIcon?: ClassNameValue, trailingIcon?: ClassNameValue, label?: ClassNameValue }
}
