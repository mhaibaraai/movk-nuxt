import type { IsComponent } from '../core'
import type { AutoFormControl, AutoFormControls } from '../types/auto-form'
import type { TypedZodFactory } from '../utils/auto-form-factory'
import { z } from 'zod/v4'
import { applyMeta, createLayoutFactory, createObjectFactory, createZodFactoryMethod } from '../utils/auto-form-factory'
import WithClear from '../components/input/WithClear.vue'
import WithPasswordToggle from '../components/input/WithPasswordToggle.vue'
import WithCopy from '../components/input/WithCopy.vue'
import WithCharacterLimit from '../components/input/WithCharacterLimit.vue'
import DatePicker from '../components/calendar/DatePicker.vue'
import { UInput, UInputNumber, UCheckbox, USwitch, UTextarea } from '#components'

export function useAutoForm() {
  function defineControl<C extends IsComponent>(e: AutoFormControl<C>):
  AutoFormControl<C> {
    return e
  }

  function createZodFactory<TControls extends AutoFormControls = typeof DEFAULT_CONTROLS>(
    _controls?: TControls
  ): TypedZodFactory<TControls> {
    return {
      string: createZodFactoryMethod(z.string),
      number: createZodFactoryMethod(z.number),
      boolean: createZodFactoryMethod(z.boolean),
      date: createZodFactoryMethod(z.date),

      array: <T extends z.ZodType>(schema: T, meta?: any) => applyMeta(z.array(schema), meta),

      layout: createLayoutFactory(),

      object: createObjectFactory('object'),
      looseObject: createObjectFactory('looseObject'),
      strictObject: createObjectFactory('strictObject')
    } as unknown as TypedZodFactory<TControls>
  }

  const afz = createZodFactory()

  const DEFAULT_CONTROL_PROPS = { class: 'w-full' } as const

  const DEFAULT_CONTROLS = {
    // 基础类型
    string: defineControl({ component: UInput, controlProps: DEFAULT_CONTROL_PROPS }),
    number: defineControl({ component: UInputNumber, controlProps: DEFAULT_CONTROL_PROPS }),
    boolean: defineControl({ component: UCheckbox, controlProps: DEFAULT_CONTROL_PROPS }),
    date: defineControl({ component: DatePicker, controlProps: DEFAULT_CONTROL_PROPS }),
    switch: defineControl({ component: USwitch, controlProps: DEFAULT_CONTROL_PROPS }),
    textarea: defineControl({ component: UTextarea, controlProps: DEFAULT_CONTROL_PROPS }),

    // 增强型输入组件
    withClear: defineControl({ component: WithClear, controlProps: DEFAULT_CONTROL_PROPS }),
    withPasswordToggle: defineControl({ component: WithPasswordToggle, controlProps: DEFAULT_CONTROL_PROPS }),
    withCopy: defineControl({ component: WithCopy, controlProps: DEFAULT_CONTROL_PROPS }),
    withCharacterLimit: defineControl({ component: WithCharacterLimit, controlProps: DEFAULT_CONTROL_PROPS })
  } as const satisfies AutoFormControls

  return {
    defineControl, afz, DEFAULT_CONTROLS
  }
}
