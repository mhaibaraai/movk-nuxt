import type { AutoFormControls } from '../types'
import { UCalendar, UInput, UInputNumber, USwitch } from '#components'
import { createAutoFormControl } from '../shared/auto-form'
import WithClear from '../components/input/WithClear.vue'
import WithPasswordToggle from '../components/input/WithPasswordToggle.vue'
import WithCopy from '../components/input/WithCopy.vue'
import WithCharacterLimit from '../components/input/WithCharacterLimit.vue'

const CONTROL_COMPONENTS = {
  // 基础类型
  string: UInput,
  number: UInputNumber,
  boolean: USwitch,
  date: UCalendar,

  // 增强型输入组件
  withClear: WithClear,
  withPasswordToggle: WithPasswordToggle,
  withCopy: WithCopy,
  withCharacterLimit: WithCharacterLimit
} as const

const DEFAULT_CONTROL_PROPS = { class: 'w-full' } as const

export const DEFAULT_CONTROLS = Object.fromEntries(
  Object.entries(CONTROL_COMPONENTS).map(([key, component]) => [
    key,
    createAutoFormControl({ component, controlProps: DEFAULT_CONTROL_PROPS })
  ])
) as AutoFormControls
