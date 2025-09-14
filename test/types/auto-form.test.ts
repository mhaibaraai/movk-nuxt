import type { AutoFormControls } from '../../src/runtime/types'
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
      mockStringTest: createAutoFormControl({ component: MockString, props: {}, slots: { bbb: () => h('span', 'bbb') } }),
      mockNumberTest: createAutoFormControl({ component: MockNumber, props: { aaa: 111 }, slots: {} }),
    } as const satisfies AutoFormControls

    const { afz, scope } = createAutoFormZ<typeof customControls>(customControls)

    z.string({
      error: 'error',
    })

    z.strictObject({}).meta()

    const s = scope<MockState>()

    const _schema = s.object({
      name: afz.string({
        props: {
          color: 'error',
        },
      }),
      address: s.path('address').object({
        city: afz.string(),
        province: afz.string({
          component: MockString,
          props: {
            bbb: '111',
          },
          slots: {
            bbb: () => h('span', 'bbb'),
          },
        }),
      }),
    })

    // 类型断言：strip(object) 输入应保留字段提示（校验存在与类型，而非键集合完全相等）
    const _state = ref<z.input<typeof _schema>>({
      name: '',
      address: {
        city: '',
        province: '',
      },
    })
  })
})
