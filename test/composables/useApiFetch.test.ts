import { describe, it, expect, vi, beforeEach } from 'vitest'
import { ref } from 'vue'
import { useApiFetch } from '../../src/runtime/composables/useApiFetch'
import * as nuxtImports from '#imports'
import * as apiUtils from '../../src/runtime/utils/api-utils'

vi.mock('#imports')
vi.mock('../../src/runtime/utils/api-utils')

describe('useApiFetch', () => {
  const mockFetch = vi.fn()
  const mockApiInstance = {
    $fetch: mockFetch,
    use: vi.fn(),
    getConfig: vi.fn(() => ({
      baseURL: '/api',
      auth: { enabled: false },
      toast: { enabled: true },
      success: { successCodes: [200, 0], codeKey: 'code', dataKey: 'data' },
      builtinHooks: {}
    }))
  }

  const mockUseFetch = vi.fn()

  beforeEach(() => {
    vi.clearAllMocks()

    // Mock useNuxtApp
    vi.mocked(nuxtImports.useNuxtApp).mockReturnValue({
      $api: mockApiInstance
    } as any)

    // Mock useFetch
    vi.mocked(nuxtImports.useFetch).mockImplementation(mockUseFetch)

    // Mock createTransform
    vi.mocked(apiUtils.createTransform).mockReturnValue((data: any) => data)

    // Mock mergeFetchHooks
    vi.mocked(apiUtils.mergeFetchHooks).mockImplementation((builtin, user) => user as any)
  })

  describe('useApiFetch', () => {
    it('应调用 useFetch 并传递正确的参数', () => {
      const url = '/users'
      const options = {
        method: 'GET' as const,
        query: { page: 1 }
      }

      useApiFetch(url, options)

      expect(mockUseFetch).toHaveBeenCalledWith(
        url,
        expect.objectContaining({
          method: 'GET',
          query: { page: 1 },
          $fetch: mockFetch
        })
      )
    })

    it('应提取并传递 skipBusinessCheck 到 createTransform', () => {
      const url = '/users'

      useApiFetch(url, {
        skipBusinessCheck: true
      })

      expect(apiUtils.createTransform).toHaveBeenCalledWith(
        expect.objectContaining({
          skipBusinessCheck: true,
          successConfig: expect.any(Object)
        })
      )
    })

    it('应支持端点切换', () => {
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

      useApiFetch('/users', {
        endpoint: 'v2'
      })

      expect(mockApiInstance.use).toHaveBeenCalledWith('v2')
      expect(mockUseFetch).toHaveBeenCalledWith(
        '/users',
        expect.objectContaining({
          $fetch: mockV2Instance.$fetch
        })
      )
    })

    it('应传递 UseFetchOptions 到 useFetch', () => {
      const options = {
        method: 'POST' as const,
        body: { name: 'test' },
        query: { filter: 'active' },
        headers: { 'X-Custom': 'value' },
        lazy: false,
        server: true,
        immediate: true
      }

      useApiFetch('/users', options)

      expect(mockUseFetch).toHaveBeenCalledWith(
        '/users',
        expect.objectContaining({
          method: 'POST',
          body: { name: 'test' },
          query: { filter: 'active' },
          headers: { 'X-Custom': 'value' },
          lazy: false,
          server: true,
          immediate: true
        })
      )
    })

    it('应传递 transform 函数到 useFetch', () => {
      const mockTransform = vi.fn()
      vi.mocked(apiUtils.createTransform).mockReturnValue(mockTransform)

      useApiFetch('/users')

      // 验证 useFetch 被调用，且包含 transform
      expect(mockUseFetch).toHaveBeenCalledWith(
        '/users',
        expect.objectContaining({
          transform: mockTransform
        })
      )
    })

    it('应合并内置 hooks 和用户自定义 hooks', () => {
      const userOnResponse = vi.fn()
      const userOnRequest = vi.fn()
      const mockMergedHooks = {
        onRequest: userOnRequest,
        onResponse: userOnResponse,
        onRequestError: vi.fn(),
        onResponseError: vi.fn()
      }

      vi.mocked(apiUtils.mergeFetchHooks).mockReturnValue(mockMergedHooks)

      useApiFetch('/users', {
        onRequest: userOnRequest,
        onResponse: userOnResponse
      })

      expect(apiUtils.mergeFetchHooks).toHaveBeenCalledWith(
        {}, // builtinHooks
        expect.objectContaining({
          onRequest: userOnRequest,
          onResponse: userOnResponse
        })
      )

      const callArgs = mockUseFetch.mock.calls[0][1]
      expect(callArgs.onRequest).toBe(mockMergedHooks.onRequest)
      expect(callArgs.onResponse).toBe(mockMergedHooks.onResponse)
    })

    it('应使用默认 API 实例(不指定 endpoint)', () => {
      useApiFetch('/users')

      expect(mockApiInstance.use).not.toHaveBeenCalled()
      expect(mockUseFetch).toHaveBeenCalledWith(
        '/users',
        expect.objectContaining({
          $fetch: mockFetch
        })
      )
    })

    it('应支持响应式 URL', () => {
      const urlRef = ref('/users')

      useApiFetch(urlRef)

      expect(mockUseFetch).toHaveBeenCalledWith(
        urlRef,
        expect.any(Object)
      )
    })

    it('应支持 URL getter 函数', () => {
      const urlGetter = () => '/users'

      useApiFetch(urlGetter)

      expect(mockUseFetch).toHaveBeenCalledWith(
        urlGetter,
        expect.any(Object)
      )
    })
  })


  describe('集成测试', () => {
    it('应正确处理完整的请求流程', () => {
      const mockTransform = vi.fn(data => data)

      vi.mocked(apiUtils.createTransform).mockReturnValue(mockTransform)

      mockUseFetch.mockReturnValue({
        data: ref({ id: 1, name: 'test' }),
        pending: ref(false),
        error: ref(null),
        refresh: vi.fn()
      })

      const result = useApiFetch('/users', {
        method: 'GET',
        skipBusinessCheck: false
      })

      expect(result).toBeDefined()
      expect(apiUtils.createTransform).toHaveBeenCalledWith(
        expect.objectContaining({
          skipBusinessCheck: false,
          successConfig: expect.any(Object)
        })
      )
    })

    it('应正确处理错误场景', () => {
      const mockError = new Error('Network error')

      mockUseFetch.mockReturnValue({
        data: ref(null),
        pending: ref(false),
        error: ref(mockError),
        refresh: vi.fn()
      })

      const result = useApiFetch('/users')

      expect(result.error.value).toBe(mockError)
    })

    it('应支持 watch 选项', () => {
      const page = ref(1)

      useApiFetch('/users', {
        query: { page },
        watch: [page]
      })

      expect(mockUseFetch).toHaveBeenCalledWith(
        '/users',
        expect.objectContaining({
          query: { page },
          watch: [page]
        })
      )
    })

    it('应支持 default 选项', () => {
      const defaultFn = () => ({ id: 0, name: 'default' })

      useApiFetch('/users', {
        default: defaultFn
      } as any)

      expect(mockUseFetch).toHaveBeenCalledWith(
        '/users',
        expect.objectContaining({
          default: defaultFn
        })
      )
    })
  })
})
