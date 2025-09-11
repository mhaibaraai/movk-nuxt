import type { AutoFormControls } from '../../src/runtime/types'
import { describe, it, vi } from 'vitest'
import { h } from 'vue'
import { createAutoFormControl, createAutoFormZ } from '../../src/runtime/shared/auto-form'

vi.mock('../../src/runtime/constants/auto-form', () => ({ DEFAULT_CONTROLS: {} }))

describe('auto-form typing', () => {
  it('priority: component > type > zodType', () => {
    const MockNumber = (_props: { aaa?: number }, _ctx: { slots?: { bbb?: () => void } }) => null
    const customControls = {
      mockTest: createAutoFormControl({ component: MockNumber, props: { aaa: 111 }, slots: {} }),
    } as const satisfies AutoFormControls

    const afz = createAutoFormZ(customControls)

    const _schema = afz.objectOf<{ name: string, age: number, sex: string }>()({
      name: afz.z.string({
        component: MockNumber,
        controlProps: { aaa: 1 },
        controlSlots: {
          bbb: () => '123',
        },
      }),
      age: afz.z.number({ type: 'mockTest', controlProps: {}, controlSlots: {} }),
      sex: afz.z.number({ label: 'sex', controlProps: { color: 'info' }, controlSlots: { decrement: () => [h('span', '123')] } }),
    })
  })
})
