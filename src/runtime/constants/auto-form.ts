import type { AutoFormControls } from '../types'
import { UCalendar, UCheckbox, UCheckboxGroup, UColorPicker, UFileUpload, UInput, UInputMenu, UInputNumber, UInputTags, UPinInput, URadioGroup, USelect, USelectMenu, USlider, USwitch, UTextarea } from '#components'
import { createAutoFormControl } from '../shared/auto-form'

export const DEFAULT_CONTROLS = {
  // 基础类型
  string: createAutoFormControl({ component: UInput, props: { class: 'w-full' } }),
  number: createAutoFormControl({ component: UInputNumber, props: { class: 'w-full' } }),
  boolean: createAutoFormControl({ component: USwitch, props: { class: 'w-full' } }),
  date: createAutoFormControl({ component: UCalendar, props: { class: 'w-full' } }),

  // enum: createAutoFormControl({ component: USelect }),

  // 'object': createAutoFormControl({ component: UInput }),
  // 'array': createAutoFormControl({ component: UInputTags }),
  // 'union': createAutoFormControl({ component: USelect }),

  // 'textarea': createAutoFormControl({ component: UTextarea }),
  // 'checkbox': createAutoFormControl({ component: UCheckbox }),
  // 'checkbox-group': createAutoFormControl({ component: UCheckboxGroup }),
  // 'radio-group': createAutoFormControl({ component: URadioGroup }),
  // 'select-menu': createAutoFormControl({ component: USelectMenu }),
  // 'input-menu': createAutoFormControl({ component: UInputMenu }),
  // 'slider': createAutoFormControl({ component: USlider }),
  // 'color': createAutoFormControl({ component: UColorPicker }),
  // 'tags': createAutoFormControl({ component: UInputTags }),
  // 'file': createAutoFormControl({ component: UFileUpload }),
  // 'pin': createAutoFormControl({ component: UPinInput }),
} as const satisfies AutoFormControls
