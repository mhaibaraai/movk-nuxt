import type {
  ApiResponse,
  ApiAuthConfig,
  LoginOptions,
  LoginResult,
  UseApiAuthReturn
} from '../types/api'
import { getPath } from '@movk/core'
import { useNuxtApp, useRuntimeConfig, useUserSession } from '#imports'
import type { User, UserSession } from '#auth-utils'

/**
 * API 认证 Composable
 *
 * 提供完整的登录、登出、刷新用户信息等功能，
 * 与 nuxt-auth-utils 无缝集成。
 *
 * @returns UseApiAuthReturn 认证相关方法和状态
 *
 * @example
 * ```ts
 * const { login, clear, loggedIn, user } = useApiAuth()
 *
 * // 基础登录
 * await login({
 *   loginPath: '/auth/login',
 *   credentials: { username: 'admin', password: '123456' }
 * })
 *
 * // 登录后获取用户信息
 * await login({
 *   loginPath: '/auth/login',
 *   credentials: { username: 'admin', password: '123456' },
 *   userInfoPath: '/auth/me'
 * })
 *
 * // 自定义 token 提取和 session 构建
 * await login({
 *   loginPath: '/auth/login',
 *   credentials: { username: 'admin', password: '123456' },
 *   tokenExtractor: (res) => res.data?.accessToken,
 *   sessionBuilder: (user, token) => ({
 *     user: { id: user.id, name: user.name },
 *     secure: { token, permissions: user.permissions }
 *   })
 * })
 *
 * // 自定义 Session 配置（过期时间、Cookie 配置等）
 * await login({
 *   loginPath: '/auth/login',
 *   credentials: { username: 'admin', password: '123456' },
 *   sessionConfig: {
 *     maxAge: 60 * 60 * 24 * 7, // 7 天
 *     name: 'my-app-session',
 *     cookie: {
 *       httpOnly: true,
 *       secure: true,
 *       sameSite: 'lax'
 *     }
 *   }
 * })
 *
 * // 登出
 * await clear()
 *
 * // 响应式状态
 * if (loggedIn.value) {
 *   console.log('当前用户:', user.value)
 * }
 * ```
 */
export function useApiAuth(): UseApiAuthReturn {
  const { $api } = useNuxtApp()
  const userSession = useUserSession()
  const moduleConfig = useRuntimeConfig().public.movkApi

  /**
   * 构建 Authorization Header 值
   */
  const buildAuthHeader = (token: string, authConfig: Partial<ApiAuthConfig> = {}): string => {
    const tokenType = authConfig.tokenType === 'Custom'
      ? (authConfig.customTokenType || '')
      : (authConfig.tokenType || 'Bearer')

    return tokenType ? `${tokenType} ${token}` : token
  }

  /**
   * 获取 Header 名称
   */
  const getHeaderName = (authConfig: Partial<ApiAuthConfig> = {}): string => {
    return authConfig.headerName || 'Authorization'
  }

  /**
   * 默认 token 提取器
   */
  const defaultTokenExtractor = <LoginRData = unknown>(response: ApiResponse<LoginRData>): string | null | undefined => {
    return (getPath(response, 'data.token') as string | undefined)
      ?? (getPath(response, 'data.accessToken') as string | undefined)
      ?? (getPath(response, 'token') as string | undefined)
  }

  /**
   * 默认 session 构建器
   */
  const defaultSessionBuilder = (user: User, token: string): UserSession => ({
    user,
    token,
    loggedInAt: new Date().toISOString()
  })

  /**
   * 执行登录流程
   *
   * 1. 调用登录接口获取 token
   * 2. 如果配置了 userInfoPath，使用 token 调用用户信息接口
   * 3. 构建 session 数据并设置到 nuxt-auth-utils
   * 4. 刷新客户端 session 状态
   */
  async function login<LoginRData = unknown>(
    options: LoginOptions<LoginRData>
  ): Promise<LoginResult> {
    const {
      loginPath,
      credentials,
      userInfoPath,
      tokenExtractor = defaultTokenExtractor,
      sessionBuilder = defaultSessionBuilder,
      sessionConfig,
      endpoint
    } = options

    const api = endpoint ? $api.use(endpoint) : $api

    // 1. 调用登录接口
    const loginResponse = await api.$fetch<ApiResponse<LoginRData>>(loginPath, {
      method: 'POST',
      body: credentials as Record<string, unknown>
    })

    // 2. 提取 token
    const token = tokenExtractor(loginResponse)
    if (!token) {
      throw new Error('Login failed: token not found in response')
    }

    // 3. 获取用户信息
    let userInfo: User

    if (userInfoPath) {
      const endpointConfig = api.getConfig()
      const authConfig = endpointConfig.auth || moduleConfig.auth || {}

      const headerName = getHeaderName(authConfig)
      const headerValue = buildAuthHeader(token, authConfig)

      const userResponse = await api.$fetch<ApiResponse<User>>(userInfoPath, {
        headers: { [headerName]: headerValue },
        context: { toast: false }
      })
      userInfo = (getPath(userResponse, 'data') ?? userResponse) as User
    }
    else {
      userInfo = (getPath(loginResponse, 'data') ?? loginResponse) as User
    }

    // 4. 构建 session 数据
    const sessionData = sessionBuilder(userInfo, token)

    // 5. 设置 session（通过服务端 API）
    await $fetch('/api/_movk/session', {
      method: 'POST',
      body: {
        session: sessionData,
        config: sessionConfig
      }
    })

    // 6. 刷新客户端 session 状态
    await userSession.fetch()

    return { user: userInfo, token }
  }

  return {
    login,
    ...userSession
  }
}
