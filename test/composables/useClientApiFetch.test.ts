import { describe, it, expect, vi, beforeEach } from 'vitest'
import { ref } from 'vue'
import { useClientApiFetch } from '../../src/runtime/composables/useClientApiFetch'
import * as nuxtImports from '#imports'
import * as apiUtils from '../../src/runtime/utils/api-utils'

vi.mock('#imports')
vi.mock('../../src/runtime/utils/api-utils')

describe('useClientApiFetch', () => {
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

  describe('基础功能', () => {
    it('应调用 useFetch 并设置 server: false, lazy: true', () => {
      useClientApiFetch('/user/preferences')

      expect(mockUseFetch).toHaveBeenCalledWith(
        '/user/preferences',
        expect.objectContaining({
          server: false,
          lazy: true
        })
      )
    })

    it('应保留用户传递的其他选项', () => {
      useClientApiFetch('/users', {
        method: 'POST',
        body: { name: 'test' }
      })

      expect(mockUseFetch).toHaveBeenCalledWith(
        '/users',
        expect.objectContaining({
          server: false,
          lazy: true,
          method: 'POST',
          body: { name: 'test' }
        })
      )
    })

    it('应覆盖显式传递的 server 和 lazy 选项', () => {
      useClientApiFetch('/users', {
        server: true as any,
        lazy: false as any
      })

      expect(mockUseFetch).toHaveBeenCalledWith(
        '/users',
        expect.objectContaining({
          server: false,
          lazy: true
        })
      )
    })
  })

  describe('响应式 URL', () => {
    it('应支持响应式 URL', () => {
      const urlRef = ref('/users')

      useClientApiFetch(urlRef as any)

      expect(mockUseFetch).toHaveBeenCalledWith(
        urlRef,
        expect.objectContaining({
          server: false,
          lazy: true
        })
      )
    })

    it('应支持 URL getter 函数', () => {
      const urlGetter = () => '/users'

      useClientApiFetch(urlGetter)

      expect(mockUseFetch).toHaveBeenCalledWith(
        urlGetter,
        expect.objectContaining({
          server: false,
          lazy: true
        })
      )
    })
  })

  describe('API 选项集成', () => {
    it('应支持 skipBusinessCheck 选项', () => {
      useClientApiFetch('/users', {
        skipBusinessCheck: true
      })

      expect(apiUtils.createTransform).toHaveBeenCalledWith(
        expect.objectContaining({
          skipBusinessCheck: true
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
          success: {},
          builtinHooks: {}
        }))
      }

      mockApiInstance.use.mockReturnValue(mockV2Instance)

      useClientApiFetch('/users', {
        endpoint: 'v2'
      })

      expect(mockApiInstance.use).toHaveBeenCalledWith('v2')
      expect(mockUseFetch).toHaveBeenCalledWith(
        '/users',
        expect.objectContaining({
          $fetch: mockV2Instance.$fetch,
          server: false,
          lazy: true
        })
      )
    })

    it('应支持自定义 transform', () => {
      const userTransform = vi.fn((data: any) => data.items)

      useClientApiFetch('/users', {
        transform: userTransform
      })

      expect(apiUtils.createTransform).toHaveBeenCalledWith(
        expect.objectContaining({
          userTransform
        })
      )
    })
  })

  describe('Hooks 集成', () => {
    it('应支持自定义 hooks', () => {
      const userOnResponse = vi.fn()
      const userOnRequest = vi.fn()

      useClientApiFetch('/users', {
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
    })
  })

  describe('返回值', () => {
    it('应返回与 useApiFetch 相同的返回值', () => {
      const mockReturn = {
        data: ref({ id: 1, name: 'test' }),
        pending: ref(false),
        error: ref(null),
        refresh: vi.fn(),
        execute: vi.fn()
      }

      mockUseFetch.mockReturnValue(mockReturn)

      const result = useClientApiFetch('/users')

      expect(result).toEqual(mockReturn)
      expect(result.execute).toBe(mockReturn.execute)
    })
  })

  describe('请求配置选项', () => {
    it('应支持 query 参数', () => {
      useClientApiFetch('/users', {
        query: { page: 1, limit: 10 }
      })

      expect(mockUseFetch).toHaveBeenCalledWith(
        '/users',
        expect.objectContaining({
          query: { page: 1, limit: 10 },
          server: false,
          lazy: true
        })
      )
    })

    it('应支持 headers 配置', () => {
      useClientApiFetch('/users', {
        headers: { 'X-Custom': 'value' }
      })

      expect(mockUseFetch).toHaveBeenCalledWith(
        '/users',
        expect.objectContaining({
          headers: { 'X-Custom': 'value' },
          server: false,
          lazy: true
        })
      )
    })

    it('应支持 watch 选项', () => {
      const pageRef = ref(1)

      useClientApiFetch('/users', {
        query: { page: pageRef },
        watch: [pageRef]
      })

      expect(mockUseFetch).toHaveBeenCalledWith(
        '/users',
        expect.objectContaining({
          query: { page: pageRef },
          watch: [pageRef],
          server: false,
          lazy: true
        })
      )
    })

    it('应支持 default 选项', () => {
      const defaultFn = () => ({ items: [] })

      useClientApiFetch('/users', {
        default: defaultFn as any
      })

      expect(mockUseFetch).toHaveBeenCalledWith(
        '/users',
        expect.objectContaining({
          default: defaultFn,
          server: false,
          lazy: true
        })
      )
    })
  })

  describe('使用场景', () => {
    it('应适合获取客户端专属数据(用户偏好设置)', () => {
      useClientApiFetch('/user/preferences')

      const callArgs = mockUseFetch.mock.calls[0][1]
      expect(callArgs.server).toBe(false)
      expect(callArgs.lazy).toBe(true)
    })

    it('应适合获取非 SEO 敏感数据(个人信息)', () => {
      useClientApiFetch('/user/profile')

      const callArgs = mockUseFetch.mock.calls[0][1]
      expect(callArgs.server).toBe(false)
      expect(callArgs.lazy).toBe(true)
    })

    it('应需要手动调用 execute() 触发请求', () => {
      const mockExecute = vi.fn()

      mockUseFetch.mockReturnValue({
        data: ref(null),
        pending: ref(false),
        error: ref(null),
        refresh: vi.fn(),
        execute: mockExecute
      })

      const { execute } = useClientApiFetch('/users')

      expect(mockExecute).not.toHaveBeenCalled()

      execute()

      expect(mockExecute).toHaveBeenCalled()
    })
  })

  describe('错误处理', () => {
    it('应正确处理错误响应', () => {
      const mockError = new Error('Network error')

      mockUseFetch.mockReturnValue({
        data: ref(null),
        pending: ref(false),
        error: ref(mockError),
        refresh: vi.fn(),
        execute: vi.fn()
      })

      const result = useClientApiFetch('/users')

      expect(result.error.value).toBe(mockError)
    })

    it('应支持自定义错误处理', () => {
      const onError = vi.fn()

      useClientApiFetch('/users', {
        onResponseError: onError as any
      })

      expect(apiUtils.mergeFetchHooks).toHaveBeenCalledWith(
        {},
        expect.objectContaining({
          onResponseError: onError
        })
      )
    })
  })
})
