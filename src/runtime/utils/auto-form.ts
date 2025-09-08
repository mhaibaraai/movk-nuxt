import type { GlobalMeta } from 'zod/v4'
import type { ComponentProps, ComponentSlots, IsComponent } from '../core'
import type { AutoFormControl, AutoFormControls, BuiltInAutoFormMetaType } from '../types'
import defu from 'defu'
import { z } from 'zod/v4'
import { joinPath } from '../core'

interface AutoFormIntrospectedField {
  path: string
  schema: z.ZodType
  zodType: string
  meta: GlobalMeta
}

// 解包” Zod schema，移除 .optional() 和 .default() 等外层修饰，返回最核心的内部 Zod 类型
function unwrapOptionalDefault<T extends z.ZodType>(schema: T): z.ZodType {
  let cur: any = schema
  while (cur?.def?.innerType) cur = cur.def.innerType
  return cur as z.ZodType
}
// 递归地分析 Zod schema，返回一个包含所有字段信息的数组
export function introspectSchema(schema: z.ZodType, parentPath?: string): AutoFormIntrospectedField[] {
  const result: AutoFormIntrospectedField[] = []
  const root = unwrapOptionalDefault(schema)
  const type = (root as any).type

  if (type === 'object') {
    const shape = (root as any).shape
    for (const key of Object.keys(shape)) {
      const child = shape[key] as z.ZodType
      const path = joinPath([...(parentPath ? [parentPath] : []), key])
      result.push(...introspectSchema(child, path))
    }
    return result
  }

  if (type === 'array') {
    const item = (root as any).element as z.ZodType
    const path = joinPath([...(parentPath ? [parentPath] : []), 0])
    result.push(...introspectSchema(item, path))
    return result
  }

  result.push({
    path: parentPath ?? '',
    schema: root,
    zodType: type,
    meta: (root.meta?.() || {}) as GlobalMeta,
  })
  return result
}

export function resolveControl(entry: AutoFormIntrospectedField, mapping: AutoFormControls) {
  const meta = entry.meta || {}

  // 决策优先级: meta.component > meta.type > 自动映射
  let chosenType: string | undefined
  let chosenComponent: IsComponent | undefined
  let mapped: AutoFormControl<IsComponent> | undefined

  if (meta.component) {
    chosenComponent = meta.component
  }
  else if (meta.type) {
    chosenType = meta.type
    mapped = mapping[meta.type]
    chosenComponent = mapped?.component
  }
  else {
    chosenType = entry.zodType
    mapped = mapping[entry.zodType]
    chosenComponent = mapped?.component
  }

  // 以 meta 优先：字段级自定义覆盖默认映射
  const props = defu(meta.controlProps, mapped?.props)
  const slots = defu(meta.controlSlots, mapped?.slots)

  return {
    type: chosenType,
    component: chosenComponent,
    props,
    slots,
  }
}

export function createControl<T extends IsComponent>(e: {
  component: T
  props?: ComponentProps<T>
  slots?: ComponentSlots<T>
}): AutoFormControl<T> {
  return { component: e.component, props: e.props, slots: e.slots }
}

// objectOf 的 shape 约束：基于接口 T 的键名提示；值类型放宽为 z.ZodTypeAny，便于逐项细化
type ShapeFor<T> = {
  [K in keyof T]?: z.ZodTypeAny
}

// 严格版本：必须完全覆盖 T 的键，且不允许多余键
type StrictShapeFor<T> = {
  [K in keyof T]-?: z.ZodTypeAny
} & { [x: string]: never }

export function createAutoFormZ<TC extends AutoFormControls>(controls?: TC) {
  // 键名提示：子集版本（允许只定义部分键）
  function objectOf<T>() {
    return function makeObject(shape: ShapeFor<T>) {
      return z.object(shape as Record<string, z.ZodTypeAny>)
    }
  }

  // 键名提示：严格版本（必须完整匹配 T 的全部键，且不允许多余键）
  function objectOfStrict<T>() {
    return function makeObject(shape: StrictShapeFor<T>) {
      return z.object(shape as Record<string, z.ZodTypeAny>) as unknown as z.ZodObject<any>
    }
  }

  return {
    objectOf,
    objectOfStrict,
    // 透传给调用侧：若需要基于 controls 的运行时行为（例如文档展示）
    controls: (controls || ({} as TC)),
    // 为 meta 提供类型提示（联合：内建 + 用户 controls 键 + 开放字符串）
    meta<M extends Omit<GlobalMeta, 'type'> & { type?: BuiltInAutoFormMetaType | Extract<keyof TC, string> | (string & {}) }>(m: M) {
      return m as GlobalMeta
    },
  }
}
