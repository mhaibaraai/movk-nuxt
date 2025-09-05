import type { $ZodTypeDef } from 'zod/v4/core'
import type { IsComponent } from '../../core'
import type { AutoFormOptions, FieldMeta } from '../../types'
import type { Control, Controls } from './controls'
import defu from 'defu'
import { defaultControls } from './controls'

export interface ResolvedControl {
  type?: string
  component?: any
  props: Record<string, any>
  ui?: Record<string, any>
}

export function resolveControl(meta: FieldMeta = {}, options: AutoFormOptions = {}) {
  const mapping: Controls = defu(options.controls, defaultControls)

  // 决策优先级: meta.component > meta.type > 自动映射（此处仅提供前两者；自动映射待后续补充）
  let chosenType: $ZodTypeDef['type'] | string | undefined
  let chosenComponent: IsComponent | undefined
  let mapped: Control<IsComponent> | undefined

  if (meta.component) {
    chosenComponent = meta.component
  }
  else if (meta.type) {
    chosenType = meta.type
    mapped = mapping[meta.type]
    chosenComponent = mapped?.component
  }
  else if (mapping.zodString) {
    mapped = mapping.ZodString
    chosenComponent = mapped?.component
  }

  const props = defu(mapped?.defaults, meta.controlProps)
  const ui = defu(mapped?.defaults, meta.controlUi)

  if (!chosenComponent) {
    devWarn('控件未映射，回退为输入框。建议设置 meta.type 或 component。', { meta })
  }

  devDebug('resolveControl', { chosenType, hasComponent: !!chosenComponent, props, ui })

  return {
    type: chosenType,
    component: chosenComponent,
    props,
    ui,
  }
}
