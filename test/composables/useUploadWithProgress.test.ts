import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { useUploadWithProgress } from '../../src/runtime/composables/useUploadWithProgress'
import * as nuxtImports from '#imports'
import * as apiUtils from '../../src/runtime/utils/api-utils'

vi.mock('#imports')
vi.mock('../../src/runtime/utils/api-utils')

describe('useUploadWithProgress', () => {
  let mockXhr: any
  let xhrMockClass: any

  const mockApiInstance = {
    $fetch: vi.fn(),
    use: vi.fn(),
    getConfig: vi.fn(() => ({
      baseURL: '/api',
      auth: { enabled: false },
      toast: { enabled: true },
      success: { successCodes: [200, 0], codeKey: 'code', dataKey: 'data' }
    }))
  }

  beforeEach(() => {
    vi.clearAllMocks()

    // Mock XMLHttpRequest
    mockXhr = {
      open: vi.fn(),
      send: vi.fn(),
      setRequestHeader: vi.fn(),
      abort: vi.fn(),
      upload: {
        addEventListener: vi.fn()
      },
      addEventListener: vi.fn(),
      responseText: '',
      status: 200
    }

    xhrMockClass = vi.fn(() => mockXhr)
    global.XMLHttpRequest = xhrMockClass as any

    // Mock useNuxtApp
    vi.mocked(nuxtImports.useNuxtApp).mockReturnValue({
      $api: mockApiInstance
    } as any)

    // Mock api-utils functions
    vi.mocked(apiUtils.isBusinessSuccess).mockReturnValue(true)
    vi.mocked(apiUtils.extractMessage).mockReturnValue('上传成功')
    vi.mocked(apiUtils.extractToastMessage).mockReturnValue('上传成功')
    vi.mocked(apiUtils.showToast).mockImplementation(() => {})
    vi.mocked(apiUtils.getAuthHeaders).mockReturnValue({})
  })

  afterEach(() => {
    vi.restoreAllMocks()
  })

  describe('初始化', () => {
    it('应返回正确的响应式状态', () => {
      const { progress, uploading, data, error, upload, abort } = useUploadWithProgress()

      expect(progress.value).toBe(0)
      expect(uploading.value).toBe(false)
      expect(data.value).toBeNull()
      expect(error.value).toBeNull()
      expect(typeof upload).toBe('function')
      expect(typeof abort).toBe('function')
    })
  })

  describe('上传功能', () => {
    it('应正确构建 FormData 并发送请求', async () => {
      const { upload } = useUploadWithProgress()
      const testFile = new File(['content'], 'test.txt', { type: 'text/plain' })

      mockXhr.responseText = JSON.stringify({
        code: 0,
        data: { id: 1, url: '/uploads/test.txt' }
      })

      const uploadPromise = upload('/upload', testFile)

      // 触发 load 事件
      const loadHandler = mockXhr.addEventListener.mock.calls.find(
        ([event]: any) => event === 'load'
      )?.[1]
      loadHandler?.()

      await uploadPromise

      expect(mockXhr.open).toHaveBeenCalledWith('POST', '/api/upload')
      expect(mockXhr.send).toHaveBeenCalled()

      const formData = mockXhr.send.mock.calls[0][0]
      expect(formData).toBeInstanceOf(FormData)
    })

    it('应支持上传多个文件', async () => {
      const { upload } = useUploadWithProgress()
      const files = [
        new File(['content1'], 'test1.txt'),
        new File(['content2'], 'test2.txt')
      ]

      mockXhr.responseText = JSON.stringify({ code: 0, data: { count: 2 } })

      const uploadPromise = upload('/upload', files)

      const loadHandler = mockXhr.addEventListener.mock.calls.find(
        ([event]: any) => event === 'load'
      )?.[1]
      loadHandler?.()

      await uploadPromise

      expect(mockXhr.send).toHaveBeenCalled()
    })

    it('应支持自定义字段名', async () => {
      const { upload } = useUploadWithProgress()
      const file = new File(['content'], 'test.txt')

      mockXhr.responseText = JSON.stringify({ code: 0, data: {} })

      const uploadPromise = upload('/upload', file, {
        fieldName: 'customFile'
      })

      const loadHandler = mockXhr.addEventListener.mock.calls.find(
        ([event]: any) => event === 'load'
      )?.[1]
      loadHandler?.()

      await uploadPromise

      expect(mockXhr.send).toHaveBeenCalled()
    })

    it('应支持额外的表单字段', async () => {
      const { upload } = useUploadWithProgress()
      const file = new File(['content'], 'test.txt')

      mockXhr.responseText = JSON.stringify({ code: 0, data: {} })

      const uploadPromise = upload('/upload', file, {
        fields: {
          userId: '123',
          category: 'documents'
        }
      })

      const loadHandler = mockXhr.addEventListener.mock.calls.find(
        ([event]: any) => event === 'load'
      )?.[1]
      loadHandler?.()

      await uploadPromise

      expect(mockXhr.send).toHaveBeenCalled()
    })
  })

  describe('进度监控', () => {
    it('应正确更新上传进度', async () => {
      const { upload, progress, uploading } = useUploadWithProgress()
      const file = new File(['content'], 'test.txt')

      mockXhr.responseText = JSON.stringify({ code: 0, data: {} })

      const uploadPromise = upload('/upload', file)

      expect(uploading.value).toBe(true)
      expect(progress.value).toBe(0)

      // 触发进度事件
      const progressHandler = mockXhr.upload.addEventListener.mock.calls.find(
        ([event]: any) => event === 'progress'
      )?.[1]

      progressHandler?.({ lengthComputable: true, loaded: 50, total: 100 })
      expect(progress.value).toBe(50)

      progressHandler?.({ lengthComputable: true, loaded: 100, total: 100 })
      expect(progress.value).toBe(100)

      // 触发 load 事件
      const loadHandler = mockXhr.addEventListener.mock.calls.find(
        ([event]: any) => event === 'load'
      )?.[1]
      loadHandler?.()

      await uploadPromise

      expect(uploading.value).toBe(false)
    })

    it('应处理不可计算的进度', async () => {
      const { upload, progress } = useUploadWithProgress()
      const file = new File(['content'], 'test.txt')

      mockXhr.responseText = JSON.stringify({ code: 0, data: {} })

      upload('/upload', file)

      const progressHandler = mockXhr.upload.addEventListener.mock.calls.find(
        ([event]: any) => event === 'progress'
      )?.[1]

      progressHandler?.({ lengthComputable: false, loaded: 50, total: 0 })

      // 进度不应更新
      expect(progress.value).toBe(0)
    })
  })

  describe('成功回调', () => {
    it('应在上传成功时调用 onSuccess', async () => {
      const { upload } = useUploadWithProgress()
      const file = new File(['content'], 'test.txt')
      const onSuccess = vi.fn()

      const responseData = { code: 0, data: { id: 1 } }
      mockXhr.responseText = JSON.stringify(responseData)

      const uploadPromise = upload('/upload', file, { onSuccess })

      const loadHandler = mockXhr.addEventListener.mock.calls.find(
        ([event]: any) => event === 'load'
      )?.[1]
      loadHandler?.()

      await uploadPromise

      expect(onSuccess).toHaveBeenCalledWith(responseData)
    })

    it('应在上传成功时显示 Toast', async () => {
      const { upload } = useUploadWithProgress()
      const file = new File(['content'], 'test.txt')

      mockXhr.responseText = JSON.stringify({ code: 0, data: {} })

      const uploadPromise = upload('/upload', file)

      const loadHandler = mockXhr.addEventListener.mock.calls.find(
        ([event]: any) => event === 'load'
      )?.[1]
      loadHandler?.()

      await uploadPromise

      expect(apiUtils.showToast).toHaveBeenCalledWith(
        'success',
        '上传成功',
        undefined,
        expect.any(Object)
      )
    })

    it('应支持自定义成功消息', async () => {
      const { upload } = useUploadWithProgress()
      const file = new File(['content'], 'test.txt')

      vi.mocked(apiUtils.extractToastMessage).mockReturnValue('文件上传完成')
      mockXhr.responseText = JSON.stringify({ code: 0, data: {} })

      const uploadPromise = upload('/upload', file, {
        toast: { successMessage: '文件上传完成' }
      })

      const loadHandler = mockXhr.addEventListener.mock.calls.find(
        ([event]: any) => event === 'load'
      )?.[1]
      loadHandler?.()

      await uploadPromise

      expect(apiUtils.extractToastMessage).toHaveBeenCalledWith(
        { successMessage: '文件上传完成' },
        'success',
        '上传成功'
      )
    })
  })

  describe('错误处理', () => {
    it('应处理业务错误', async () => {
      const { upload, error } = useUploadWithProgress()
      const file = new File(['content'], 'test.txt')
      const onError = vi.fn()

      vi.mocked(apiUtils.isBusinessSuccess).mockReturnValue(false)
      vi.mocked(apiUtils.extractMessage).mockReturnValue('文件太大')
      mockXhr.responseText = JSON.stringify({ code: 400, message: '文件太大' })

      const uploadPromise = upload('/upload', file, { onError })

      const loadHandler = mockXhr.addEventListener.mock.calls.find(
        ([event]: any) => event === 'load'
      )?.[1]
      loadHandler?.()

      const result = await uploadPromise

      expect(result.error).toBeTruthy()
      expect(result.error?.message).toBe('文件太大')
      expect(error.value?.message).toBe('文件太大')
      expect(onError).toHaveBeenCalled()
    })

    it('应处理网络错误', async () => {
      const { upload, error } = useUploadWithProgress()
      const file = new File(['content'], 'test.txt')
      const onError = vi.fn()

      const uploadPromise = upload('/upload', file, { onError })

      const errorHandler = mockXhr.addEventListener.mock.calls.find(
        ([event]: any) => event === 'error'
      )?.[1]
      errorHandler?.()

      const result = await uploadPromise

      expect(result.error?.message).toBe('网络错误')
      expect(error.value?.message).toBe('网络错误')
      expect(onError).toHaveBeenCalled()
    })

    it('应处理 JSON 解析错误', async () => {
      const { upload, error } = useUploadWithProgress()
      const file = new File(['content'], 'test.txt')

      mockXhr.responseText = 'invalid json'

      const uploadPromise = upload('/upload', file)

      const loadHandler = mockXhr.addEventListener.mock.calls.find(
        ([event]: any) => event === 'load'
      )?.[1]
      loadHandler?.()

      const result = await uploadPromise

      expect(result.error).toBeTruthy()
      expect(error.value).toBeTruthy()
    })

    it('应在错误时显示 Toast', async () => {
      const { upload } = useUploadWithProgress()
      const file = new File(['content'], 'test.txt')

      vi.mocked(apiUtils.isBusinessSuccess).mockReturnValue(false)
      vi.mocked(apiUtils.extractMessage).mockReturnValue('上传失败')
      mockXhr.responseText = JSON.stringify({ code: 500, message: '上传失败' })

      const uploadPromise = upload('/upload', file)

      const loadHandler = mockXhr.addEventListener.mock.calls.find(
        ([event]: any) => event === 'load'
      )?.[1]
      loadHandler?.()

      await uploadPromise

      expect(apiUtils.showToast).toHaveBeenCalledWith(
        'error',
        '上传失败',
        undefined,
        expect.any(Object)
      )
    })
  })

  describe('中止上传', () => {
    it('应支持中止上传', async () => {
      const { upload, abort, uploading, error } = useUploadWithProgress()
      const file = new File(['content'], 'test.txt')

      const uploadPromise = upload('/upload', file)

      expect(uploading.value).toBe(true)

      abort()

      expect(mockXhr.abort).toHaveBeenCalled()

      // 触发 abort 事件
      const abortHandler = mockXhr.addEventListener.mock.calls.find(
        ([event]: any) => event === 'abort'
      )?.[1]
      abortHandler?.()

      const result = await uploadPromise

      expect(uploading.value).toBe(false)
      expect(result.error?.message).toBe('上传已取消')
      expect(error.value?.message).toBe('上传已取消')
    })

    it('中止后应重置进度', () => {
      const { abort, progress, uploading } = useUploadWithProgress()

      abort()

      expect(progress.value).toBe(0)
      expect(uploading.value).toBe(false)
    })
  })

  describe('端点切换', () => {
    it('应支持使用不同端点上传', async () => {
      const { upload } = useUploadWithProgress()
      const file = new File(['content'], 'test.txt')

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
      mockXhr.responseText = JSON.stringify({ code: 0, data: {} })

      const uploadPromise = upload('/upload', file, { endpoint: 'v2' })

      expect(mockApiInstance.use).toHaveBeenCalledWith('v2')
      expect(mockXhr.open).toHaveBeenCalledWith('POST', '/api/v2/upload')

      const loadHandler = mockXhr.addEventListener.mock.calls.find(
        ([event]: any) => event === 'load'
      )?.[1]
      loadHandler?.()

      await uploadPromise
    })
  })

  describe('认证', () => {
    it('应添加认证 headers', async () => {
      const { upload } = useUploadWithProgress()
      const file = new File(['content'], 'test.txt')

      vi.mocked(apiUtils.getAuthHeaders).mockReturnValue({
        Authorization: 'Bearer test-token'
      })

      mockXhr.responseText = JSON.stringify({ code: 0, data: {} })

      const uploadPromise = upload('/upload', file)

      expect(mockXhr.setRequestHeader).toHaveBeenCalledWith(
        'Authorization',
        'Bearer test-token'
      )

      const loadHandler = mockXhr.addEventListener.mock.calls.find(
        ([event]: any) => event === 'load'
      )?.[1]
      loadHandler?.()

      await uploadPromise
    })

    it('应合并用户自定义 headers', async () => {
      const { upload } = useUploadWithProgress()
      const file = new File(['content'], 'test.txt')

      vi.mocked(apiUtils.getAuthHeaders).mockReturnValue({
        Authorization: 'Bearer token'
      })

      mockXhr.responseText = JSON.stringify({ code: 0, data: {} })

      const uploadPromise = upload('/upload', file, {
        headers: { 'X-Custom': 'value' }
      })

      expect(mockXhr.setRequestHeader).toHaveBeenCalledWith('X-Custom', 'value')
      expect(mockXhr.setRequestHeader).toHaveBeenCalledWith('Authorization', 'Bearer token')

      const loadHandler = mockXhr.addEventListener.mock.calls.find(
        ([event]: any) => event === 'load'
      )?.[1]
      loadHandler?.()

      await uploadPromise
    })
  })

  describe('Toast 禁用', () => {
    it('应支持禁用 Toast', async () => {
      const { upload } = useUploadWithProgress()
      const file = new File(['content'], 'test.txt')

      mockXhr.responseText = JSON.stringify({ code: 0, data: {} })

      const uploadPromise = upload('/upload', file, { toast: false })

      const loadHandler = mockXhr.addEventListener.mock.calls.find(
        ([event]: any) => event === 'load'
      )?.[1]
      loadHandler?.()

      await uploadPromise

      expect(apiUtils.showToast).not.toHaveBeenCalled()
    })
  })
})
