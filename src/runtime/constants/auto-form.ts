import type { AutoFormControls } from '../types'
import { UCalendar, UInput, UInputNumber, USwitch } from '#components'
import { createAutoFormControl } from '../shared/auto-form'

export const DEFAULT_CONTROLS = {
  // 基础类型
  string: createAutoFormControl({ component: UInput, props: { class: 'w-full' } }),
  number: createAutoFormControl({ component: UInputNumber, props: { class: 'w-full' } }),
  boolean: createAutoFormControl({ component: USwitch, props: { class: 'w-full' } }),
  date: createAutoFormControl({ component: UCalendar, props: { class: 'w-full' } }),
} as const satisfies AutoFormControls
