import type { AutoFormControls } from '../types'
import { UCalendar, UInput, UInputNumber, USwitch } from '#components'
import { markRaw } from 'vue'
import { createAutoFormControl } from '../shared/auto-form'

export const DEFAULT_CONTROLS = {
  // 基础类型
  string: createAutoFormControl({ component: markRaw(UInput), props: { class: 'w-full' } }),
  number: createAutoFormControl({ component: markRaw(UInputNumber), props: { class: 'w-full' } }),
  boolean: createAutoFormControl({ component: markRaw(USwitch), props: { class: 'w-full' } }),
  date: createAutoFormControl({ component: markRaw(UCalendar), props: { class: 'w-full' } }),
} as const satisfies AutoFormControls
