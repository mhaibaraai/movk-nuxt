import { beforeEach, describe, expect, it, vi } from 'vitest'

const toastAdd = vi.fn()

vi.mock('#imports', () => ({
  useNuxtApp: () => ({
    vueApp: { runWithContext: (fn: () => unknown) => fn() }
  }),
  useToast: () => ({ add: toastAdd })
}))

const { showToast } = await import('../../../src/runtime/domains/api/toast')

const baseGlobal = {
  enabled: true,
  success: { show: true, color: 'success', icon: 'i-lucide-circle-check' },
  error: { show: true, color: 'error', icon: 'i-lucide-circle-x' }
} as const

describe('domains/api/toast.showToast', () => {
  beforeEach(() => {
    toastAdd.mockClear()
  })

  it('未配置 duration 时 payload 不含 duration 键（让 Nuxt UI 全局 toaster 接管）', () => {
    showToast('success', '操作完成', undefined, baseGlobal)
    expect(toastAdd).toHaveBeenCalledTimes(1)
    const payload = toastAdd.mock.calls[0][0] as Record<string, unknown>
    expect('duration' in payload).toBe(false)
    expect(payload.title).toBe('操作完成')
    expect(payload.color).toBe('success')
    expect(payload.icon).toBe('i-lucide-circle-check')
  })

  it('显式配置 duration 时按优先级覆盖：请求级 > 全局级', () => {
    showToast(
      'error',
      '失败',
      { error: { duration: 9000 } },
      { ...baseGlobal, error: { ...baseGlobal.error, duration: 5000 } }
    )
    const payload = toastAdd.mock.calls[0][0] as Record<string, unknown>
    expect(payload.duration).toBe(9000)
  })

  it('全局 enabled=false 时短路', () => {
    showToast('success', 'x', undefined, { ...baseGlobal, enabled: false })
    expect(toastAdd).not.toHaveBeenCalled()
  })

  it('requestOptions=false 时短路', () => {
    showToast('success', 'x', false, baseGlobal)
    expect(toastAdd).not.toHaveBeenCalled()
  })

  it('typeConfig.show=false 时仅对应类型短路', () => {
    showToast('success', 'x', undefined, { ...baseGlobal, success: { ...baseGlobal.success, show: false } })
    expect(toastAdd).not.toHaveBeenCalled()

    showToast('error', 'y', undefined, { ...baseGlobal, success: { ...baseGlobal.success, show: false } })
    expect(toastAdd).toHaveBeenCalledTimes(1)
  })

  it('requestOptions[type]=false 时短路', () => {
    showToast('success', 'x', { success: false }, baseGlobal)
    expect(toastAdd).not.toHaveBeenCalled()
  })

  it('ApiResponse 来源时按 responseConfig 抽取 message', () => {
    const response = { code: 0, message: '来自响应' }
    showToast('success', response, undefined, baseGlobal, { messageKey: 'message' })
    const payload = toastAdd.mock.calls[0][0] as Record<string, unknown>
    expect(payload.title).toBe('来自响应')
  })

  it('requestOptions.successMessage 覆盖响应抽取', () => {
    const response = { code: 0, message: '响应' }
    showToast('success', response, { successMessage: '自定义' }, baseGlobal, { messageKey: 'message' })
    const payload = toastAdd.mock.calls[0][0] as Record<string, unknown>
    expect(payload.title).toBe('自定义')
  })

  it('payload 内不出现 show 字段（仅作为 ApiToastConfig 的开关）', () => {
    showToast('success', '操作完成', undefined, baseGlobal)
    const payload = toastAdd.mock.calls[0][0] as Record<string, unknown>
    expect('show' in payload).toBe(false)
  })
})
