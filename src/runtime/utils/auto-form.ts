import type { GlobalMeta, z } from 'zod/v4'
import type { IsComponent } from '../core'
import type { AutoFormControl, AutoFormControls } from '../types'
import defu from 'defu'
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
    const shape = (root as z.ZodObject).shape
    for (const key of Object.keys(shape)) {
      const child = shape[key] as z.ZodType
      const path = joinPath([...(parentPath ? [parentPath] : []), key])
      result.push(...introspectSchema(child, path))
    }
    return result
  }

  if (type === 'array') {
    const item = (root as z.ZodArray).element as z.ZodType
    const path = joinPath([...(parentPath ? [parentPath] : []), 0])
    result.push(...introspectSchema(item, path))
    return result
  }

  result.push({
    path: parentPath ?? '',
    schema: root,
    zodType: type,
    meta: root.meta?.() || {},
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

  const props = defu(mapped?.props, meta.controlProps)
  const slots = defu(mapped?.slots, meta.controlSlots)

  if (!chosenComponent) {
    console.warn('控件未映射。建议设置 meta.type 或 component。', { meta })
  }

  return {
    type: chosenType,
    component: chosenComponent,
    props,
    slots,
  }
}
