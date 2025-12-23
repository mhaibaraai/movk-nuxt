import { describe, it, expect, vi, beforeEach } from 'vitest'
import { ref } from 'vue'
import { useApiAuth } from '../../src/runtime/composables/useApiAuth'
import * as nuxtImports from '#imports'
import * as movkCore from '@movk/core'

vi.mock('#imports')
vi.mock('@movk/core')

describe('useApiAuth', () => {
  const mockFetch = vi.fn()
  const mockApiInstance = {
    $fetch: mockFetch,
    use: vi.fn(),
    getConfig: vi.fn(() => ({
      baseURL: '/api',
      auth: {
        enabled: true,
        tokenType: 'Bearer',
        headerName: 'Authorization'
      },
      toast: { enabled: true },
      success: { successCodes: [200, 0], codeKey: 'code', dataKey: 'data' }
    }))
  }

  const mockUserSession = {
    user: ref(null),
    loggedIn: ref(false),
    fetch: vi.fn(),
    clear: vi.fn(),
    session: ref(null)
  }

  const mockGlobalFetch = vi.fn()

  beforeEach(() => {
    vi.clearAllMocks()

    // Mock useNuxtApp
    vi.mocked(nuxtImports.useNuxtApp).mockReturnValue({
      $api: mockApiInstance
    } as any)

    // Mock useUserSession
    vi.mocked(nuxtImports.useUserSession).mockReturnValue(mockUserSession as any)

    // Mock useRuntimeConfig
    vi.mocked(nuxtImports.useRuntimeConfig).mockReturnValue({
      public: {
        movkApi: {
          auth: {
            enabled: true,
            tokenType: 'Bearer',
            headerName: 'Authorization'
          }
        }
      }
    } as any)

    // Mock global $fetch
    global.$fetch = mockGlobalFetch as any

    // Mock getPath from @movk/core
    vi.mocked(movkCore.getPath).mockImplementation((obj: any, path: string) => {
      const parts = path.split('.')
      let current = obj
      for (const part of parts) {
        if (current && typeof current === 'object' && part in current) {
          current = current[part]
        }
        else {
          return undefined
        }
      }
      return current
    })
  })

  describe('基础登录流程', () => {
    it('应成功登录并设置 session', async () => {
      const loginResponse = {
        code: 0,
        data: {
          token: 'test-token-123',
          id: 1,
          username: 'testuser'
        }
      }

      mockFetch.mockResolvedValueOnce(loginResponse)
      mockGlobalFetch.mockResolvedValueOnce({ ok: true })
      mockUserSession.fetch.mockResolvedValueOnce(undefined)

      const { login } = useApiAuth()

      const result = await login({
        loginPath: '/auth/login',
        credentials: { username: 'testuser', password: 'password123' }
      })

      expect(mockFetch).toHaveBeenCalledWith('/auth/login', {
        method: 'POST',
        body: { username: 'testuser', password: 'password123' }
      })

      expect(mockGlobalFetch).toHaveBeenCalledWith('/api/_movk/session', {
        method: 'POST',
        body: expect.objectContaining({
          user: expect.any(Object),
          token: 'test-token-123'
        })
      })

      expect(mockUserSession.fetch).toHaveBeenCalled()
      expect(result.token).toBe('test-token-123')
    })

    it('应支持从 data.accessToken 提取 token', async () => {
      const loginResponse = {
        code: 0,
        data: {
          accessToken: 'access-token-456'
        }
      }

      mockFetch.mockResolvedValueOnce(loginResponse)
      mockGlobalFetch.mockResolvedValueOnce({ ok: true })

      const { login } = useApiAuth()

      const result = await login({
        loginPath: '/auth/login',
        credentials: { username: 'test', password: 'pass' }
      })

      expect(result.token).toBe('access-token-456')
    })

    it('应在 token 缺失时抛出错误', async () => {
      mockFetch.mockResolvedValueOnce({
        code: 0,
        data: { id: 1, username: 'test' }
      })

      const { login } = useApiAuth()

      await expect(
        login({
          loginPath: '/auth/login',
          credentials: { username: 'test', password: 'pass' }
        })
      ).rejects.toThrow('Login failed: token not found in response')
    })
  })

  describe('获取用户信息', () => {
    it('应在登录后调用 userInfoPath 获取用户信息', async () => {
      const loginResponse = {
        code: 0,
        data: { token: 'test-token' }
      }

      const userInfoResponse = {
        code: 0,
        data: {
          id: 1,
          username: 'testuser',
          email: 'test@example.com'
        }
      }

      mockFetch.mockResolvedValueOnce(loginResponse)
      mockFetch.mockResolvedValueOnce(userInfoResponse)
      mockGlobalFetch.mockResolvedValueOnce({ ok: true })

      const { login } = useApiAuth()

      const result = await login({
        loginPath: '/auth/login',
        credentials: { username: 'test', password: 'pass' },
        userInfoPath: '/auth/me'
      })

      expect(mockFetch).toHaveBeenCalledTimes(2)
      expect(mockFetch).toHaveBeenNthCalledWith(2, '/auth/me', {
        headers: { Authorization: 'Bearer test-token' },
        context: { toast: false }
      })

      expect(result.user).toEqual({
        id: 1,
        username: 'testuser',
        email: 'test@example.com'
      })
    })

    it('应支持自定义认证配置(Custom token type)', async () => {
      mockApiInstance.getConfig.mockReturnValueOnce({
        baseURL: '/api',
        auth: {
          tokenType: 'Custom',
          customTokenType: 'ApiKey',
          headerName: 'X-API-Key'
        },
        toast: {},
        success: {}
      })

      const loginResponse = {
        code: 0,
        data: { token: 'custom-token' }
      }

      const userInfoResponse = {
        code: 0,
        data: { id: 1, username: 'test' }
      }

      mockFetch.mockResolvedValueOnce(loginResponse)
      mockFetch.mockResolvedValueOnce(userInfoResponse)
      mockGlobalFetch.mockResolvedValueOnce({ ok: true })

      const { login } = useApiAuth()

      await login({
        loginPath: '/auth/login',
        credentials: { username: 'test', password: 'pass' },
        userInfoPath: '/auth/me'
      })

      expect(mockFetch).toHaveBeenNthCalledWith(2, '/auth/me', {
        headers: { 'X-API-Key': 'ApiKey custom-token' },
        context: { toast: false }
      })
    })
  })

  describe('自定义 token 提取器', () => {
    it('应使用自定义 tokenExtractor', async () => {
      const loginResponse = {
        code: 0,
        result: {
          auth: {
            bearerToken: 'custom-extracted-token'
          }
        }
      }

      mockFetch.mockResolvedValueOnce(loginResponse)
      mockGlobalFetch.mockResolvedValueOnce({ ok: true })

      const { login } = useApiAuth()

      const customExtractor = (res: any) => res.result?.auth?.bearerToken

      const result = await login({
        loginPath: '/auth/login',
        credentials: { username: 'test', password: 'pass' },
        tokenExtractor: customExtractor
      })

      expect(result.token).toBe('custom-extracted-token')
    })
  })

  describe('自定义 session 构建器', () => {
    it('应使用自定义 sessionBuilder', async () => {
      const loginResponse = {
        code: 0,
        data: {
          token: 'test-token',
          id: 1,
          username: 'test',
          permissions: ['read', 'write']
        }
      }

      mockFetch.mockResolvedValueOnce(loginResponse)
      mockGlobalFetch.mockResolvedValueOnce({ ok: true })

      const { login } = useApiAuth()

      const customBuilder = (user: any, token: string) => ({
        user: { id: user.id, name: user.username },
        secure: { token, permissions: user.permissions }
      })

      await login({
        loginPath: '/auth/login',
        credentials: { username: 'test', password: 'pass' },
        sessionBuilder: customBuilder
      })

      expect(mockGlobalFetch).toHaveBeenCalledWith('/api/_movk/session', {
        method: 'POST',
        body: {
          user: { id: 1, name: 'test' },
          secure: {
            token: 'test-token',
            permissions: ['read', 'write']
          }
        }
      })
    })
  })

  describe('端点切换', () => {
    it('应支持使用不同端点登录', async () => {
      const mockV2Instance = {
        $fetch: vi.fn().mockResolvedValue({
          code: 0,
          data: { token: 'v2-token' }
        }),
        getConfig: vi.fn(() => ({
          baseURL: '/api/v2',
          auth: {},
          toast: {},
          success: {}
        }))
      }

      mockApiInstance.use.mockReturnValue(mockV2Instance)
      mockGlobalFetch.mockResolvedValueOnce({ ok: true })

      const { login } = useApiAuth()

      await login({
        loginPath: '/auth/login',
        credentials: { username: 'test', password: 'pass' },
        endpoint: 'v2'
      })

      expect(mockApiInstance.use).toHaveBeenCalledWith('v2')
      expect(mockV2Instance.$fetch).toHaveBeenCalledWith('/auth/login', {
        method: 'POST',
        body: { username: 'test', password: 'pass' }
      })
    })
  })

  describe('userSession 集成', () => {
    it('应暴露 userSession 的所有属性和方法', () => {
      const auth = useApiAuth()

      expect(auth.user).toBe(mockUserSession.user)
      expect(auth.loggedIn).toBe(mockUserSession.loggedIn)
      expect(auth.fetch).toBe(mockUserSession.fetch)
      expect(auth.clear).toBe(mockUserSession.clear)
    })

    it('应支持调用 clear 登出', async () => {
      mockUserSession.clear.mockResolvedValueOnce(undefined)

      const { clear } = useApiAuth()

      await clear()

      expect(mockUserSession.clear).toHaveBeenCalled()
    })
  })

  describe('错误处理', () => {
    it('应正确处理登录接口错误', async () => {
      mockFetch.mockRejectedValueOnce(new Error('Network error'))

      const { login } = useApiAuth()

      await expect(
        login({
          loginPath: '/auth/login',
          credentials: { username: 'test', password: 'pass' }
        })
      ).rejects.toThrow('Network error')
    })

    it('应正确处理用户信息接口错误', async () => {
      mockFetch.mockResolvedValueOnce({
        code: 0,
        data: { token: 'test-token' }
      })
      mockFetch.mockRejectedValueOnce(new Error('User info error'))

      const { login } = useApiAuth()

      await expect(
        login({
          loginPath: '/auth/login',
          credentials: { username: 'test', password: 'pass' },
          userInfoPath: '/auth/me'
        })
      ).rejects.toThrow('User info error')
    })

    it('应正确处理 session 设置错误', async () => {
      mockFetch.mockResolvedValueOnce({
        code: 0,
        data: { token: 'test-token' }
      })
      mockGlobalFetch.mockRejectedValueOnce(new Error('Session error'))

      const { login } = useApiAuth()

      await expect(
        login({
          loginPath: '/auth/login',
          credentials: { username: 'test', password: 'pass' }
        })
      ).rejects.toThrow('Session error')
    })
  })

  describe('完整登录流程', () => {
    it('应正确执行完整的登录-获取用户信息-设置session流程', async () => {
      const loginResponse = {
        code: 0,
        data: { token: 'complete-token' }
      }

      const userInfoResponse = {
        code: 0,
        data: {
          id: 100,
          username: 'fulluser',
          email: 'full@example.com',
          roles: ['admin']
        }
      }

      mockFetch.mockResolvedValueOnce(loginResponse)
      mockFetch.mockResolvedValueOnce(userInfoResponse)
      mockGlobalFetch.mockResolvedValueOnce({ ok: true })
      mockUserSession.fetch.mockResolvedValueOnce(undefined)

      const { login } = useApiAuth()

      const result = await login({
        loginPath: '/auth/login',
        credentials: { username: 'fulluser', password: 'secure123' },
        userInfoPath: '/auth/me'
      })

      // 验证调用顺序
      expect(mockFetch).toHaveBeenNthCalledWith(1, '/auth/login', {
        method: 'POST',
        body: { username: 'fulluser', password: 'secure123' }
      })

      expect(mockFetch).toHaveBeenNthCalledWith(2, '/auth/me', {
        headers: { Authorization: 'Bearer complete-token' },
        context: { toast: false }
      })

      expect(mockGlobalFetch).toHaveBeenCalledWith('/api/_movk/session', {
        method: 'POST',
        body: expect.objectContaining({
          user: {
            id: 100,
            username: 'fulluser',
            email: 'full@example.com',
            roles: ['admin']
          },
          token: 'complete-token',
          loggedInAt: expect.any(String)
        })
      })

      expect(mockUserSession.fetch).toHaveBeenCalled()

      expect(result).toEqual({
        user: {
          id: 100,
          username: 'fulluser',
          email: 'full@example.com',
          roles: ['admin']
        },
        token: 'complete-token'
      })
    })
  })
})
