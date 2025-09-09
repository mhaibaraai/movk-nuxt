import type { DEFAULT_CONTROLS } from '../constants/auto-form'
import type { ComponentProps, ComponentSlots, IsComponent, Merge } from '../core'
import { UInputNumber } from '#components'
import { z } from 'zod/v4'

export interface AutoFormControl<C extends IsComponent> {
  component: C
  props?: ComponentProps<C>
  slots?: ComponentSlots<C>
}

export type AutoFormControls = Record<string, AutoFormControl<IsComponent>>

type ShapeFor<T> = {
  [K in keyof T]?: z.ZodType
}

type StrictShapeFor<T> = {
  [K in keyof T]-?: z.ZodType
} & { [x: string]: never }

export function createAutoFormZ<T extends object = object, AFC extends AutoFormControls = AutoFormControls>() {
  // 创建统一的控件映射，自定义控件覆盖默认控件
  type UnifiedControls = Merge<typeof DEFAULT_CONTROLS, AFC>

  // 控件类型枚举
  type AutoFormControlType = keyof UnifiedControls

  // 安全的组件类型提取
  type COf<K extends AutoFormControlType> = K extends keyof UnifiedControls
    ? UnifiedControls[K] extends AutoFormControl<infer C>
      ? C
      : never
    : never

  // 增强的 WithControlMeta 类型，支持函数重载的动态类型推断
  type WithControlMeta<TSchema extends z.ZodType, C extends IsComponent> = Omit<TSchema, 'meta'> & {
    // 重载1: 不指定 type，使用当前组件 C 的类型
    meta: {
      // 保持与原生 zod meta() 方法兼容
      (): z.GlobalMeta | undefined

      // 不指定 type，使用当前组件 C 的类型
      (meta: z.GlobalMeta & {
        controlProps?: ComponentProps<C>
        controlSlots?: ComponentSlots<C>
      }): WithControlMeta<TSchema, C>

      // 指定 type，根据类型动态推断对应控件的组件类型
      <K extends AutoFormControlType>(meta: z.GlobalMeta & {
        type: K
        controlProps?: ComponentProps<COf<K>>
        controlSlots?: ComponentSlots<COf<K>>
      }): WithControlMeta<TSchema, COf<K>>
    }
  }

  const string = () => z.string() as WithControlMeta<z.ZodString, COf<'string'>>
  const number = () => z.number() as WithControlMeta<z.ZodNumber, COf<'number'>>

  const objectOf = () => {
    return function makeObject(shape: ShapeFor<T>) {
      return z.object(shape as Record<string, z.ZodType>)
    }
  }

  const objectOfStrict = () => {
    return function makeObject(shape: StrictShapeFor<T>) {
      return z.object(shape as Record<string, z.ZodType>) as unknown as z.ZodObject<any>
    }
  }

  return {
    string,
    number,
    objectOf,
    objectOfStrict,
  }
}

export function createControl<T extends IsComponent>(e: {
  component: T
  props?: ComponentProps<T>
  slots?: ComponentSlots<T>
}): AutoFormControl<T> {
  return { component: e.component, props: e.props, slots: e.slots }
}

interface ApiUser {
  name: string
  age: number
  email: string
  address: {
    street: string
    city: string
    state: string
    zip: string
  }
  phone: string
  role: 'user' | 'admin'
}

const _controls = {
  test: createControl({
    component: UInputNumber,
    props: {
      class: 'w-full',
    },
  }),
} as const satisfies AutoFormControls

const test = createAutoFormZ<ApiUser, typeof _controls>()

test.objectOf()({
  name: test.string().meta({ controlProps: {} }),
  age: test.number().meta({ type: '', controlProps: {}, controlSlots: {} }),
})
