import type { AutoFormControls } from '../types'
import { UAccordion, UCalendar, UInput, UInputNumber, USwitch } from '#components'
import { createAutoFormControl } from '../shared/auto-form'

export const DEFAULT_CONTROLS = {
  // 基础类型
  string: createAutoFormControl({ component: UInput, controlProps: { class: 'w-full' } }),
  number: createAutoFormControl({ component: UInputNumber, controlProps: { class: 'w-full' } }),
  boolean: createAutoFormControl({ component: USwitch, controlProps: { class: 'w-full' } }),
  date: createAutoFormControl({ component: UCalendar, controlProps: { class: 'w-full' } }),
} as const satisfies AutoFormControls
