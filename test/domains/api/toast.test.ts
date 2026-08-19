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

  it('请求级 show=true 覆盖全局 typeConfig.show=false', () => {
    showToast(
      'success',
      'x',
      { success: { show: true } },
      { ...baseGlobal, success: { ...baseGlobal.success, show: false } }
    )
    expect(toastAdd).toHaveBeenCalledTimes(1)
  })

  it('请求级 show=true 覆盖全局 enabled=false', () => {
    showToast('success', 'x', { success: { show: true } }, { ...baseGlobal, enabled: false })
    expect(toastAdd).toHaveBeenCalledTimes(1)
  })

  it('请求级 show=false 覆盖全局 typeConfig.show=true', () => {
    showToast('success', 'x', { success: { show: false } }, baseGlobal)
    expect(toastAdd).not.toHaveBeenCalled()
  })

  it('请求级 show 不进入 payload', () => {
    showToast('success', 'x', { success: { show: true, color: 'info' } }, baseGlobal)
    const payload = toastAdd.mock.calls[0][0] as Record<string, unknown>
    expect('show' in payload).toBe(false)
    expect(payload.color).toBe('info')
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

  describe('methods 方法白名单', () => {
    const mutationOnly = {
      ...baseGlobal,
      success: { ...baseGlobal.success, methods: ['POST', 'PUT', 'PATCH', 'DELETE'] }
    }

    it('命中白名单时弹出', () => {
      showToast('success', 'x', undefined, mutationOnly, undefined, 'POST')
      expect(toastAdd).toHaveBeenCalledTimes(1)
    })

    it('未命中白名单时短路', () => {
      showToast('success', 'x', undefined, mutationOnly, undefined, 'GET')
      expect(toastAdd).not.toHaveBeenCalled()
    })

    it('method 缺省按 GET 处理', () => {
      showToast('success', 'x', undefined, mutationOnly)
      expect(toastAdd).not.toHaveBeenCalled()
    })

    it('方法比较大小写不敏感', () => {
      showToast('success', 'x', undefined, mutationOnly, undefined, 'post')
      expect(toastAdd).toHaveBeenCalledTimes(1)
    })

    it('methods 为空数组时任何方法都不命中', () => {
      showToast('success', 'x', undefined, { ...baseGlobal, success: { ...baseGlobal.success, methods: [] } }, undefined, 'POST')
      expect(toastAdd).not.toHaveBeenCalled()
    })

    it('methods 仅约束对应类型，另一类型不受影响', () => {
      showToast('error', 'x', undefined, mutationOnly, undefined, 'GET')
      expect(toastAdd).toHaveBeenCalledTimes(1)
    })

    it('未命中时请求级 show=true 仍弹出', () => {
      showToast('success', 'x', { success: { show: true } }, mutationOnly, undefined, 'GET')
      expect(toastAdd).toHaveBeenCalledTimes(1)
    })

    it('命中时请求级 show=false 仍短路', () => {
      showToast('success', 'x', { success: { show: false } }, mutationOnly, undefined, 'POST')
      expect(toastAdd).not.toHaveBeenCalled()
    })

    it('methods 不进入 payload', () => {
      showToast('success', 'x', undefined, mutationOnly, undefined, 'POST')
      const payload = toastAdd.mock.calls[0][0] as Record<string, unknown>
      expect('methods' in payload).toBe(false)
    })
  })

  describe('请求级文案隐式开启', () => {
    const successOff = { ...baseGlobal, success: { ...baseGlobal.success, show: false } }

    it('全局 typeConfig.show=false 时 successMessage 单次开启并作为文案', () => {
      showToast('success', '响应文案', { successMessage: '文件下载成功' }, successOff)
      expect(toastAdd).toHaveBeenCalledTimes(1)
      const payload = toastAdd.mock.calls[0][0] as Record<string, unknown>
      expect(payload.title).toBe('文件下载成功')
    })

    it('全局 enabled=false 时 errorMessage 单次开启', () => {
      showToast('error', 'x', { errorMessage: '下载失败' }, { ...baseGlobal, enabled: false })
      expect(toastAdd).toHaveBeenCalledTimes(1)
    })

    it('方法白名单未命中时 successMessage 仍开启', () => {
      showToast(
        'success',
        'x',
        { successMessage: '保存成功' },
        { ...baseGlobal, success: { ...baseGlobal.success, methods: ['POST'] } },
        undefined,
        'GET'
      )
      expect(toastAdd).toHaveBeenCalledTimes(1)
    })

    it('请求级 show=false 优先于 successMessage', () => {
      showToast('success', 'x', { success: { show: false }, successMessage: '不该出现' }, successOff)
      expect(toastAdd).not.toHaveBeenCalled()
    })

    it('请求级 success=false 优先于 successMessage', () => {
      showToast('success', 'x', { success: false, successMessage: '不该出现' }, successOff)
      expect(toastAdd).not.toHaveBeenCalled()
    })

    it('纯样式覆盖不隐式开启', () => {
      showToast('success', 'x', { success: { duration: 5000 } }, successOff)
      expect(toastAdd).not.toHaveBeenCalled()
    })

    it('空字符串文案不隐式开启', () => {
      showToast('success', 'x', { successMessage: '' }, successOff)
      expect(toastAdd).not.toHaveBeenCalled()
    })

    it('errorMessage 不会开启已关闭的成功提示', () => {
      showToast('success', 'x', { errorMessage: '失败文案' }, successOff)
      expect(toastAdd).not.toHaveBeenCalled()
    })
  })
})
