import type { AutoFormControls } from '../types'
import { UCalendar, UInput, UInputNumber, USwitch } from '#components'
import { createAutoFormControl } from '../shared/auto-form'
import WithClear from '../components/input/WithClear.vue'
import WithPasswordToggle from '../components/input/WithPasswordToggle.vue'

export const DEFAULT_CONTROLS = {
  // 基础类型
  string: createAutoFormControl({ component: UInput, controlProps: { class: 'w-full' } }),
  number: createAutoFormControl({ component: UInputNumber, controlProps: { class: 'w-full' } }),
  boolean: createAutoFormControl({ component: USwitch, controlProps: { class: 'w-full' } }),
  date: createAutoFormControl({ component: UCalendar, controlProps: { class: 'w-full' } }),

  // 增强型输入组件
  withClear: createAutoFormControl({ component: WithClear, controlProps: { class: 'w-full' } }),
  withPasswordToggle: createAutoFormControl({ component: WithPasswordToggle, controlProps: { class: 'w-full' } })
} as const satisfies AutoFormControls
