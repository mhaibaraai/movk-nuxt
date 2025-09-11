import type { AutoFormControls } from '../types'
import { UCalendar, UCheckbox, UCheckboxGroup, UColorPicker, UFileUpload, UInput, UInputMenu, UInputNumber, UInputTags, UPinInput, URadioGroup, USelect, USelectMenu, USlider, USwitch, UTextarea } from '#components'
import { createAutoFormControl } from '../shared/auto-form'

export const DEFAULT_CONTROLS = {
  // 基础类型
  'string': createAutoFormControl({ component: UInput }),
  'number': createAutoFormControl({ component: UInputNumber }),
  'boolean': createAutoFormControl({ component: USwitch }),
  'enum': createAutoFormControl({ component: USelect }),
  'date': createAutoFormControl({ component: UCalendar }),

  // 复合类型
  'object': createAutoFormControl({ component: UInput }), // 可以使用 JSON 输入或自定义对象编辑器
  'array': createAutoFormControl({ component: UInputTags }), // 数组默认使用标签输入
  'union': createAutoFormControl({ component: USelect }),

  // 自定义类型（通过 meta.type 指定）
  'textarea': createAutoFormControl({ component: UTextarea }),
  'checkbox': createAutoFormControl({ component: UCheckbox }),
  'checkbox-group': createAutoFormControl({ component: UCheckboxGroup }),
  'radio-group': createAutoFormControl({ component: URadioGroup }),
  'select-menu': createAutoFormControl({ component: USelectMenu }),
  'input-menu': createAutoFormControl({ component: UInputMenu }),
  'slider': createAutoFormControl({ component: USlider }),
  'color': createAutoFormControl({ component: UColorPicker }),
  'tags': createAutoFormControl({ component: UInputTags }),
  'file': createAutoFormControl({ component: UFileUpload }),
  'pin': createAutoFormControl({ component: UPinInput }),
} as const satisfies AutoFormControls
