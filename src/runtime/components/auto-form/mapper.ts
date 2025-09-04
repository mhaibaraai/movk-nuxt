import type { AutoFormOptions, FieldMeta } from '../../types'
import { defaultControls } from './controls'
import { devDebug, devWarn } from './dev'

interface MappedControlConfig {
  component?: any
  defaults?: Record<string, any>
  uiDefaults?: Record<string, any>
}

export interface ResolvedControl {
  type?: string
  component?: any
  props: Record<string, any>
  ui?: Record<string, any>
}

function mergeProps(
  base: Record<string, any> | undefined,
  override: Record<string, any> | undefined,
): Record<string, any> {
  return {
    ...(base || {}),
    ...(override || {}),
  }
}

export function resolveControl(meta: FieldMeta = {}, options: AutoFormOptions = {}): ResolvedControl {
  const mapping: Record<string, MappedControlConfig> = {
    ...Object.fromEntries(Object.entries(defaultControls).map(([k, v]) => [k, { component: v.component, defaults: v.defaults }])),
    ...(options.controls || {}),
  }

  // 决策优先级: meta.component > meta.type > 自动映射（此处仅提供前两者；自动映射待后续补充）
  let chosenType: string | undefined
  let chosenComponent: any | undefined
  let mapped: MappedControlConfig | undefined

  if (meta.component) {
    chosenComponent = meta.component
  }
  else if (meta.type) {
    chosenType = meta.type
    mapped = mapping[meta.type]
    chosenComponent = mapped?.component
  }
  else if (mapping.ZodString) {
    // 自动映射兜底：在调用方传入 zodType 时可精确匹配，这里仅提供默认兜底
    mapped = mapping.ZodString
    chosenComponent = mapped?.component
  }

  const props = mergeProps(mapped?.defaults, meta.controlProps)
  const ui = mergeProps(mapped?.uiDefaults, meta.controlUi)

  if (!chosenComponent) {
    devWarn(options, '控件未映射，回退为输入框。建议设置 meta.type 或 component。', { meta })
  }

  devDebug(options, 'resolveControl', { chosenType, hasComponent: !!chosenComponent, props, ui })

  return {
    type: chosenType,
    component: chosenComponent,
    props,
    ui,
  }
}
