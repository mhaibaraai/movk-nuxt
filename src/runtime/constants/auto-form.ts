import type { AutoFormControls } from '../types'
import { UCalendar, UCheckbox, UCheckboxGroup, UColorPicker, UFileUpload, UInput, UInputMenu, UInputNumber, UInputTags, UPinInput, URadioGroup, USelect, USelectMenu, USlider, USwitch, UTextarea } from '#components'
import { createControl } from '../types'

export const DEFAULT_CONTROLS = {
  // 基础类型
  'string': createControl({ component: UInput }),
  'number': createControl({ component: UInputNumber }),
  'boolean': createControl({ component: USwitch }),
  'enum': createControl({ component: USelect }),
  'date': createControl({ component: UCalendar }),
  'bigint': createControl({ component: UInputNumber }),
  
  // 复合类型
  'object': createControl({ component: UInput }), // 可以使用 JSON 输入或自定义对象编辑器
  'array': createControl({ component: UInputTags }), // 数组默认使用标签输入
  
  // 自定义类型（通过 meta.type 指定）
  'textarea': createControl({ component: UTextarea }),
  'checkbox': createControl({ component: UCheckbox }),
  'checkbox-group': createControl({ component: UCheckboxGroup }),
  'radio-group': createControl({ component: URadioGroup }),
  'select-menu': createControl({ component: USelectMenu }),
  'input-menu': createControl({ component: UInputMenu }),
  'slider': createControl({ component: USlider }),
  'color': createControl({ component: UColorPicker }),
  'tags': createControl({ component: UInputTags }),
  'file': createControl({ component: UFileUpload }),
  'pin': createControl({ component: UPinInput }),
} as const satisfies AutoFormControls
