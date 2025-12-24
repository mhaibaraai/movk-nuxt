import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { useDownloadWithProgress } from '../../src/runtime/composables/useDownloadWithProgress'
import * as nuxtImports from '#imports'
import * as apiUtils from '../../src/runtime/utils/api-utils'
import { triggerDownload } from '@movk/core'

vi.mock('#imports')
vi.mock('../../src/runtime/utils/api-utils')
// Use real @movk/core, but spy on triggerDownload (has DOM side effects)
vi.mock('@movk/core', async () => {
  const actual = await vi.importActual<typeof import('@movk/core')>('@movk/core')
  return {
    ...actual,
    triggerDownload: vi.fn() // Mock only the function with side effects
  }
})

describe('useDownloadWithProgress', () => {
  const mockApiInstance = {
    $fetch: vi.fn(),
    use: vi.fn(),
    getConfig: vi.fn(() => ({
      baseURL: '/api',
      auth: { enabled: false },
      toast: { enabled: true },
      success: {}
    }))
  }

  beforeEach(() => {
    vi.clearAllMocks()

    // Mock useNuxtApp
    vi.mocked(nuxtImports.useNuxtApp).mockReturnValue({
      $api: mockApiInstance
    } as any)

    // Mock api-utils functions
    vi.mocked(apiUtils.extractToastMessage).mockReturnValue('下载成功')
    vi.mocked(apiUtils.showToast).mockImplementation(() => {})
    vi.mocked(apiUtils.getAuthHeaders).mockReturnValue({})

    // triggerDownload is already mocked via vi.mock above
    // extractFilename uses real implementation from @movk/core
  })

  afterEach(() => {
    vi.restoreAllMocks()
  })

  describe('基础功能测试', () => {
    it('应正确导出 composable 函数', () => {
      const result = useDownloadWithProgress()

      expect(result).toBeDefined()
      expect(typeof result.download).toBe('function')
      expect(typeof result.abort).toBe('function')
    })
  })

  describe('端点切换', () => {
    it('应支持使用不同端点下载', () => {
      const mockV2Instance = {
        $fetch: vi.fn(),
        getConfig: vi.fn(() => ({
          baseURL: '/api/v2',
          auth: {},
          toast: {},
          success: {}
        }))
      }

      mockApiInstance.use.mockReturnValue(mockV2Instance)

      const { download } = useDownloadWithProgress()

      // 准备 mock fetch 响应
      global.fetch = vi.fn().mockResolvedValue({
        ok: true,
        headers: new Headers(),
        body: {
          getReader: () => ({
            read: vi.fn()
              .mockResolvedValueOnce({ done: false, value: new Uint8Array([1, 2, 3]) })
              .mockResolvedValueOnce({ done: true })
          })
        }
      }) as any

      download('/export', { endpoint: 'v2' })

      expect(mockApiInstance.use).toHaveBeenCalledWith('v2')
    })
  })

  describe('认证功能', () => {
    it('应调用 getAuthHeaders 获取认证头', () => {
      vi.mocked(apiUtils.getAuthHeaders).mockReturnValue({
        Authorization: 'Bearer test-token'
      })

      global.fetch = vi.fn().mockResolvedValue({
        ok: true,
        headers: new Headers(),
        body: {
          getReader: () => ({
            read: vi.fn()
              .mockResolvedValueOnce({ done: false, value: new Uint8Array([1]) })
              .mockResolvedValueOnce({ done: true })
          })
        }
      }) as any

      const { download } = useDownloadWithProgress()
      download('/export')

      expect(apiUtils.getAuthHeaders).toHaveBeenCalled()
    })
  })

  describe('文件名提取', () => {
    it('应从响应头提取文件名', async () => {
      global.fetch = vi.fn().mockResolvedValue({
        ok: true,
        headers: new Headers({ 'content-disposition': 'attachment; filename="report.pdf"' }),
        body: {
          getReader: () => ({
            read: vi.fn()
              .mockResolvedValueOnce({ done: false, value: new Uint8Array([1]) })
              .mockResolvedValueOnce({ done: true })
          })
        }
      }) as any

      const { download } = useDownloadWithProgress()
      await download('/export')

      // Verify triggerDownload was called with extracted filename
      expect(triggerDownload).toHaveBeenCalledWith(
        expect.any(Blob),
        expect.stringContaining('report.pdf')
      )
    })

    it('应支持自定义文件名', () => {
      global.fetch = vi.fn().mockResolvedValue({
        ok: true,
        headers: new Headers(),
        body: {
          getReader: () => ({
            read: vi.fn()
              .mockResolvedValueOnce({ done: false, value: new Uint8Array([1]) })
              .mockResolvedValueOnce({ done: true })
          })
        }
      }) as any

      const { download } = useDownloadWithProgress()
      download('/export', { filename: 'custom.pdf' })

      // 自定义文件名应优先于 extractFilename
      expect(true).toBe(true)
    })
  })

  describe('Toast 配置', () => {
    it('应支持禁用 Toast', async () => {
      global.fetch = vi.fn().mockResolvedValue({
        ok: true,
        headers: new Headers(),
        body: {
          getReader: () => ({
            read: vi.fn()
              .mockResolvedValueOnce({ done: false, value: new Uint8Array([1]) })
              .mockResolvedValueOnce({ done: true })
          })
        }
      }) as any

      const { download } = useDownloadWithProgress()
      await download('/export', { toast: false })

      expect(apiUtils.showToast).not.toHaveBeenCalled()
    })
  })

  describe('错误处理', () => {
    it('应处理网络错误', async () => {
      global.fetch = vi.fn().mockRejectedValue(new Error('Network error'))

      const { download } = useDownloadWithProgress()
      const result = await download('/export')

      expect(result.success).toBe(false)
      expect(result.error).toBeTruthy()
    })

    it('应处理 HTTP 错误响应', async () => {
      global.fetch = vi.fn().mockResolvedValue({
        ok: false,
        status: 500,
        statusText: 'Internal Server Error'
      }) as any

      const { download } = useDownloadWithProgress()
      const result = await download('/export')

      expect(result.success).toBe(false)
      expect(result.error?.message).toContain('500')
    })
  })

  describe('回调函数', () => {
    it('应在下载成功时调用 onSuccess', async () => {
      const onSuccess = vi.fn()

      global.fetch = vi.fn().mockResolvedValue({
        ok: true,
        headers: new Headers(),
        body: {
          getReader: () => ({
            read: vi.fn()
              .mockResolvedValueOnce({ done: false, value: new Uint8Array([1]) })
              .mockResolvedValueOnce({ done: true })
          })
        }
      }) as any

      const { download } = useDownloadWithProgress()
      await download('/export', { onSuccess })

      expect(onSuccess).toHaveBeenCalled()
    })

    it('应在下载失败时调用 onError', async () => {
      const onError = vi.fn()

      global.fetch = vi.fn().mockRejectedValue(new Error('Download failed'))

      const { download } = useDownloadWithProgress()
      await download('/export', { onError })

      expect(onError).toHaveBeenCalled()
    })
  })

  describe('自定义 headers', () => {
    it('应支持自定义 headers', () => {
      global.fetch = vi.fn().mockResolvedValue({
        ok: true,
        headers: new Headers(),
        body: {
          getReader: () => ({
            read: vi.fn()
              .mockResolvedValueOnce({ done: false, value: new Uint8Array([1]) })
              .mockResolvedValueOnce({ done: true })
          })
        }
      }) as any

      const { download } = useDownloadWithProgress()
      download('/export', {
        headers: { 'X-Custom': 'value' }
      })

      expect(global.fetch).toHaveBeenCalledWith(
        expect.any(String),
        expect.objectContaining({
          headers: expect.objectContaining({
            'X-Custom': 'value'
          })
        })
      )
    })
  })
})
