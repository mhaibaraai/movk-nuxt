import { describe, it, expect, vi, beforeEach } from 'vitest'
import { ref } from 'vue'
import { useApiFetch, useLazyApiFetch } from '../../src/runtime/composables/useApiFetch'
import * as nuxtImports from '#imports'
import * as apiHelpers from '../../src/runtime/utils/api-helpers'

vi.mock('#imports')
vi.mock('../../src/runtime/utils/api-helpers')

describe('useApiFetch', () => {
  const mockFetch = vi.fn()
  const mockApiInstance = {
    $fetch: mockFetch,
    use: vi.fn(),
    getConfig: vi.fn(() => ({
      baseURL: '/api',
      auth: { enabled: false },
      toast: { enabled: true },
      success: { successCodes: [200, 0], codeKey: 'code', dataKey: 'data' }
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

    // Mock createApiResponseHandler
    vi.mocked(apiHelpers.createApiResponseHandler).mockReturnValue({
      onResponse: vi.fn(),
      transform: vi.fn(data => data)
    })
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

    it('应提取并传递 API 选项到 createApiResponseHandler', () => {
      const url = '/users'
      const apiOptions = {
        toast: { successMessage: '成功' },
        unwrap: false
      }

      useApiFetch(url, {
        api: apiOptions
      })

      expect(apiHelpers.createApiResponseHandler).toHaveBeenCalledWith(
        apiOptions,
        expect.any(Object)
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

    it('应传递响应处理器到 useFetch', () => {
      const mockHandlers = {
        onResponse: vi.fn(),
        transform: vi.fn()
      }

      vi.mocked(apiHelpers.createApiResponseHandler).mockReturnValue(mockHandlers)

      useApiFetch('/users')

      expect(mockUseFetch).toHaveBeenCalledWith(
        '/users',
        expect.objectContaining({
          onResponse: mockHandlers.onResponse,
          transform: mockHandlers.transform
        })
      )
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

  describe('useLazyApiFetch', () => {
    it('应调用 useApiFetch 并设置 lazy: true', () => {
      const url = '/users'
      const options = {
        method: 'GET' as const
      }

      useLazyApiFetch(url, options)

      expect(mockUseFetch).toHaveBeenCalledWith(
        url,
        expect.objectContaining({
          lazy: true,
          method: 'GET'
        })
      )
    })

    it('应保留其他选项', () => {
      const options = {
        api: { toast: false as const },
        endpoint: 'v2',
        server: false
      }

      useLazyApiFetch('/users', options)

      expect(mockUseFetch).toHaveBeenCalledWith(
        '/users',
        expect.objectContaining({
          lazy: true,
          server: false
        })
      )
    })

    it('应覆盖显式传递的 lazy: false', () => {
      useLazyApiFetch('/users', { lazy: false } as any)

      expect(mockUseFetch).toHaveBeenCalledWith(
        '/users',
        expect.objectContaining({
          lazy: true
        })
      )
    })
  })

  describe('集成测试', () => {
    it('应正确处理完整的请求流程', () => {
      const mockTransform = vi.fn(data => data.data)

      vi.mocked(apiHelpers.createApiResponseHandler).mockReturnValue({
        onResponse: vi.fn(),
        transform: mockTransform
      })

      mockUseFetch.mockReturnValue({
        data: ref({ id: 1, name: 'test' }),
        pending: ref(false),
        error: ref(null),
        refresh: vi.fn()
      })

      const result = useApiFetch('/users', {
        method: 'GET',
        api: {
          toast: { successMessage: '获取成功' },
          unwrap: true
        }
      })

      expect(result).toBeDefined()
      expect(apiHelpers.createApiResponseHandler).toHaveBeenCalledWith(
        expect.objectContaining({
          toast: { successMessage: '获取成功' },
          unwrap: true
        }),
        expect.any(Object)
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
