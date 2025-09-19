import type { AutoFormControls, AutoFormFieldContext } from '../../src/runtime/types'
import { describe, it, vi } from 'vitest'
import { h, ref } from 'vue'
import { z } from 'zod/v4'
import { createAutoFormControl, createAutoFormZ } from '../../src/runtime/shared/auto-form'

vi.mock('../../src/runtime/constants/auto-form', () => ({ DEFAULT_CONTROLS: {} }))

describe('auto-form typing', () => {
  it('priority: component > type > zodType', () => {
    const _mockSchema = z.object({
      name: z.string(),
      age: z.number(),
      sex: z.string(),
      address: z.object({
        province: z.string(),
        city: z.string(),
        district: z.string(),
        extra: z.object({
          geo: z.object({
            lat: z.number(),
            lng: z.number(),
          }),
        }),
      }),
    })
    type MockState = z.infer<typeof _mockSchema>
    const MockNumber = (_props: { aaa?: number }, _ctx: { slots?: { aaa?: () => void } }) => null
    const MockString = (_props: { bbb?: string }, _ctx: { slots?: { bbb?: () => void } }) => null

    const customControls = {
      mockStringTest: createAutoFormControl({ component: MockString, controlProps: {}, controlSlots: { bbb: () => h('span', 'bbb') } }),
      mockNumberTest: createAutoFormControl({ component: MockNumber, controlProps: { aaa: 111 }, controlSlots: {} }),
    } as const satisfies AutoFormControls

    const { afz } = createAutoFormZ(customControls)

    z.string({
      error: 'error',
    })

    const _schema = afz.object<MockState>()({
      name: afz.string({
        controlProps({ state }: AutoFormFieldContext<MockState>) {
          return {
            disabled: state.age > 18,
          }
        },
      }).meta({
      }).default('default name').optional(),
      age: afz.number({
        type: 'mockNumberTest',
        controlProps: {

        },
      }),
      address: afz.object()({
        city: afz.string(),
        province: afz.string({
          component: MockString,
          controlSlots: {
            bbb: () => h('span', 'bbb'),
          },
        }),
      }),
    })

    type State = z.output<typeof _schema>

    const _state = ref({

    } as State)
  })
})
