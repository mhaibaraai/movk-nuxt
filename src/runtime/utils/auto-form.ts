import type { GlobalMeta, z } from 'zod/v4'
import type { IsComponent } from '../core'
import type { AutoFormControl, AutoFormControls } from '../types'
import defu from 'defu'
import { DEFAULT_CONTROLS } from '../constants/auto-form'
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

export function mergeControls<TCustom extends AutoFormControls>(custom?: TCustom): TCustom & typeof DEFAULT_CONTROLS {
  return defu(custom, DEFAULT_CONTROLS) as TCustom & typeof DEFAULT_CONTROLS
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
