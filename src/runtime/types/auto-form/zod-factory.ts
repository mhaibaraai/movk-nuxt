import type { z } from 'zod'
import type { DateRange } from 'reka-ui'
import type { CalendarDate, DateValue, Time } from '@internationalized/date'
import type {
  ComponentProps,
  ComponentSlots,
  IsAny,
  IsComponent,
  KnownKeys,
  Prettify,
  ReactiveValue,
  UnionToIntersection,
  WidenLiteral
} from '@movk/core'
import type { AutoFormFieldContext } from './fields'
import type { AutoFormControl, AutoFormControls, AutoFormControlsMeta, _Unset, AutoFormLayoutConfig } from './controls'
import type { AUTOFORM_META } from '../../domains/auto-form/constants'

interface LayoutFieldMarker<Fields extends Record<string, z.ZodType>> extends z.ZodType<AutoFormLayoutConfig<any>, any, any> {
  __brand: typeof AUTOFORM_META.LAYOUT_KEY
  fields: Fields
}

type LayoutRestShape<S extends Record<string, any>> = {
  [P in keyof S as S[P] extends LayoutFieldMarker<any> ? never : P]: S[P]
}

type LayoutExpandedShape<S extends Record<string, any>> = UnionToIntersection<
  {
    [P in keyof S]: S[P] extends LayoutFieldMarker<infer Fields> ? ExtractLayoutShape<Fields> : {}
  }[keyof S]
>

type ExtractLayoutShape<S extends Record<string, any>> = LayoutRestShape<S> & LayoutExpandedShape<S>

type StrictComponentProps<C extends IsComponent> = {
  [K in keyof ComponentProps<C> as {} extends Record<K, unknown> ? never : K]: ComponentProps<C>[K]
}

type StrictComponentSlots<C extends IsComponent>
  = IsAny<ComponentSlots<C>> extends true ? {} : ComponentSlots<C>

type ControlKey<TControls extends AutoFormControls> = Extract<KnownKeys<TControls>, string>

type ControlEntryByKey<TControls extends AutoFormControls, K extends string>
  = K extends keyof TControls ? TControls[K] : never

type _WidenForFactory<T> = {
  [K in keyof T]+?: WidenLiteral<T[K]>
}

type ResolveControlProps<
  C extends IsComponent,
  P
> = [P] extends [_Unset]
  ? StrictComponentProps<C>
  : IsAny<P> extends true
    ? StrictComponentProps<C>
    : [unknown] extends [P]
        ? StrictComponentProps<C>
        : [keyof P] extends [never]
            ? StrictComponentProps<C>
            : Prettify<_WidenForFactory<P> & {}>

type ExtractControlProps<T> = T extends AutoFormControl<infer C, infer P, any>
  ? ResolveControlProps<C, P>
  : T extends { component: infer C extends IsComponent }
    ? StrictComponentProps<C>
    : {}

type ResolveControlSlots<
  C extends IsComponent,
  S
> = [S] extends [_Unset]
  ? StrictComponentSlots<C>
  : IsAny<S> extends true
    ? StrictComponentSlots<C>
    : [unknown] extends [S]
        ? StrictComponentSlots<C>
        : [keyof S] extends [never]
            ? StrictComponentSlots<C>
            : S

type ExtractControlSlots<T> = T extends AutoFormControl<infer C, any, infer S>
  ? ResolveControlSlots<C, S>
  : T extends { component: infer C extends IsComponent }
    ? StrictComponentSlots<C>
    : {}

type FallbackToRecordIfEmpty<T> = [keyof T] extends [never]
  ? Record<string, unknown>
  : Prettify<T & {}>

type ControlPropsByKey<
  TControls extends AutoFormControls,
  K extends ControlKey<TControls>
> = FallbackToRecordIfEmpty<ExtractControlProps<ControlEntryByKey<TControls, K>>>

type ControlSlotsByKey<
  TControls extends AutoFormControls,
  K extends ControlKey<TControls>
> = Partial<ExtractControlSlots<ControlEntryByKey<TControls, K>>>

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

type AutoFormFactoryMethod<
  TControls extends AutoFormControls,
  TResult,
  TDefaultKey extends string,
  TExtraArgs extends unknown[] = []
> = {
  <K extends ControlKey<TControls>>(...args: [...TExtraArgs, MetaByControlKey<TControls, K>]): TResult
  (...args: [...TExtraArgs, MetaByDefaultIfExists<TControls, TDefaultKey>]): TResult
  <C extends IsComponent>(
    ...args: [...TExtraArgs, MetaByComponent<C>]
  ): TResult
  (...args: [...TExtraArgs, string?]): TResult
}

/** 对象工厂重载 */
type ObjectFactoryOverloads<
  TControls extends AutoFormControls,
  Mode extends z.core.$strip | z.core.$loose | z.core.$strict,
  TDefaultKey extends string,
  ShapeConstraint = {}
> = {
  <S extends Record<string, z.ZodType>, K extends ControlKey<TControls>>(shape: S & ShapeConstraint, meta?: MetaByControlKey<TControls, K>): z.ZodObject<ExtractLayoutShape<S>, Mode>
  <S extends Record<string, z.ZodType>>(shape: S & ShapeConstraint, meta: MetaByDefaultIfExists<TControls, TDefaultKey>): z.ZodObject<ExtractLayoutShape<S>, Mode>
  <S extends Record<string, z.ZodType>, C extends IsComponent>(shape: S & ShapeConstraint, meta: MetaByComponent<C>): z.ZodObject<ExtractLayoutShape<S>, Mode>
}

export interface TypedZodFactory<TControls extends AutoFormControls> {
  string: AutoFormFactoryMethod<TControls, z.ZodString, 'string'>
  number: AutoFormFactoryMethod<TControls, z.ZodNumber, 'number'>
  boolean: AutoFormFactoryMethod<TControls, z.ZodBoolean, 'boolean'>
  file: AutoFormFactoryMethod<TControls, z.ZodType<File>, 'file'>
  email: AutoFormFactoryMethod<TControls, z.ZodString, 'string'>
  url: AutoFormFactoryMethod<TControls, z.ZodString, 'string'>
  uuid: AutoFormFactoryMethod<TControls, z.ZodString, 'string'>

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

  inputDate: AutoFormFactoryMethod<TControls, z.ZodType<CalendarDate>, 'inputDate'>
  inputTime: AutoFormFactoryMethod<TControls, z.ZodType<Time>, 'inputTime'>
  isoDatetime: AutoFormFactoryMethod<TControls, z.ZodType<string>, 'string'>
  isoDate: AutoFormFactoryMethod<TControls, z.ZodType<string>, 'string'>
  isoTime: AutoFormFactoryMethod<TControls, z.ZodType<string>, 'string'>

  array: {
    <T extends z.ZodType, K extends ControlKey<TControls>>(schema: T, overwrite?: MetaByControlKey<TControls, K>): z.ZodArray<T>
    <T extends z.ZodType>(schema: T, overwrite: MetaByDefaultIfExists<TControls, 'array'>): z.ZodArray<T>
    <T extends z.ZodType, C extends IsComponent>(schema: T, overwrite: MetaByComponent<C>): z.ZodArray<T>
  }

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

  layout: <C extends IsComponent = IsComponent, Fields extends Record<string, z.ZodType> = Record<string, z.ZodType>>(
    config: Omit<AutoFormLayoutConfig<C>, 'fields'> & { fields: Fields }
  ) => LayoutFieldMarker<Fields>

  object: {
    <T extends object>(): ObjectFactoryOverloads<TControls, z.core.$strip, 'object', Partial<Record<Extract<keyof T, string>, z.ZodType>>>
  } & ObjectFactoryOverloads<TControls, z.core.$strip, 'object'>

  looseObject: {
    <T extends object>(): ObjectFactoryOverloads<TControls, z.core.$loose, 'looseObject', Partial<Record<Extract<keyof T, string>, z.ZodType>>>
  } & ObjectFactoryOverloads<TControls, z.core.$loose, 'looseObject'>

  strictObject: {
    <T extends object>(): ObjectFactoryOverloads<TControls, z.core.$strict, 'strictObject', Partial<Record<Extract<keyof T, string>, z.ZodType>>>
  } & ObjectFactoryOverloads<TControls, z.core.$strict, 'strictObject'>
}
