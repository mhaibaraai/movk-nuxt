import { beforeEach, describe, expect, it, vi } from 'vitest'

const open = vi.fn()
const create = vi.fn(() => ({ open }))

vi.mock('#imports', () => ({
  useOverlay: () => ({ create })
}))

// 不 mock `#components`：组件名随 `prefix` 变化，useMessageBox 不应依赖它
const { useMessageBox } = await import('../../src/runtime/composables/useMessageBox')

describe('useMessageBox', () => {
  beforeEach(() => {
    open.mockReset()
    create.mockClear()
  })

  it('以异步组件创建 overlay，不依赖带前缀的组件名', async () => {
    open.mockResolvedValue(true)
    await useMessageBox().confirm({ title: '确认' })

    const [component, options] = create.mock.calls[0] as unknown as [Record<string, unknown>, unknown]
    expect(component).toHaveProperty('__asyncLoader')
    expect(options).toEqual({ destroyOnClose: true })
  })

  it('confirm 透传 mode 并在关闭无结果时返回 false', async () => {
    open.mockResolvedValue(undefined)
    const result = await useMessageBox().confirm({ title: '确认' })

    expect(open).toHaveBeenCalledWith({ title: '确认', mode: 'confirm' })
    expect(result).toBe(false)
  })

  it('alert 以 alert 模式打开', async () => {
    open.mockResolvedValue(undefined)
    await useMessageBox().alert({ title: '提示' })

    expect(open).toHaveBeenCalledWith({ title: '提示', mode: 'alert' })
  })
})
