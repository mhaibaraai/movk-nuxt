import type { AutoFormControls } from '../types'
import { UInput, UInputNumber, UCheckbox, USwitch, UTextarea } from '#components'
import { createAutoFormControl } from '../shared/auto-form'
import WithClear from '../components/input/WithClear.vue'
import WithPasswordToggle from '../components/input/WithPasswordToggle.vue'
import WithCopy from '../components/input/WithCopy.vue'
import WithCharacterLimit from '../components/input/WithCharacterLimit.vue'
import DatePicker from '../components/calendar/DatePicker.vue'

const DEFAULT_CONTROL_PROPS = { class: 'w-full' } as const

export const DEFAULT_CONTROLS = {
  // 基础类型
  string: createAutoFormControl({ component: UInput, controlProps: DEFAULT_CONTROL_PROPS }),
  number: createAutoFormControl({ component: UInputNumber, controlProps: DEFAULT_CONTROL_PROPS }),
  boolean: createAutoFormControl({ component: UCheckbox, controlProps: DEFAULT_CONTROL_PROPS }),
  date: createAutoFormControl({ component: DatePicker, controlProps: DEFAULT_CONTROL_PROPS }),
  switch: createAutoFormControl({ component: USwitch, controlProps: DEFAULT_CONTROL_PROPS }),
  textarea: createAutoFormControl({ component: UTextarea, controlProps: DEFAULT_CONTROL_PROPS }),

  // 增强型输入组件
  withClear: createAutoFormControl({ component: WithClear, controlProps: DEFAULT_CONTROL_PROPS }),
  withPasswordToggle: createAutoFormControl({ component: WithPasswordToggle, controlProps: DEFAULT_CONTROL_PROPS }),
  withCopy: createAutoFormControl({ component: WithCopy, controlProps: DEFAULT_CONTROL_PROPS }),
  withCharacterLimit: createAutoFormControl({ component: WithCharacterLimit, controlProps: DEFAULT_CONTROL_PROPS })
} as const satisfies AutoFormControls
