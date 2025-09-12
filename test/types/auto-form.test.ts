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

    const { afz, objectOf } = createAutoFormZ<{ name: string, age: number, sex: string }>(customControls)

    const _schema = objectOf()({
      name: afz.string({
        component: MockNumber,
        props: { aaa: 1 },
        slots: {
        },
      }).meta({
        label: 'name',
      }),
      age: afz.number({
        type: 'mockTest',
        props: {
          
        }, slots: {

        }
      }),
      sex: afz.number({
        props: { color: 'info' },
        slots: { decrement: () => [h('span', '123')] }
      }).meta({
        label: 'sex',
      }),
    })
  })
})
