import type {
  ApiResponse,
  AuthConfig,
  LoginOptions,
  LoginResult,
  SessionData,
  UseApiAuthReturn
} from '../types/api'
import { getPath } from '@movk/core'
import { useNuxtApp, useRuntimeConfig, useUserSession } from '#imports'

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
 * const { login, logout, loggedIn, user } = useApiAuth()
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
 * // 登出
 * await logout()
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
  const buildAuthHeader = (token: string, authConfig: Partial<AuthConfig> = {}): string => {
    const tokenType = authConfig.tokenType === 'Custom'
      ? (authConfig.customTokenType || '')
      : (authConfig.tokenType || 'Bearer')

    return tokenType ? `${tokenType} ${token}` : token
  }

  /**
   * 获取 Header 名称
   */
  const getHeaderName = (authConfig: Partial<AuthConfig> = {}): string => {
    return authConfig.headerName || 'Authorization'
  }

  /**
   * 默认 token 提取器
   */
  const defaultTokenExtractor = (response: ApiResponse): string | null | undefined => {
    return (getPath(response, 'data.token') as string | undefined)
      ?? (getPath(response, 'data.accessToken') as string | undefined)
      ?? (getPath(response, 'token') as string | undefined)
  }

  /**
   * 默认 session 构建器
   */
  const defaultSessionBuilder = <TUser>(userInfo: TUser, token: string): SessionData => ({
    user: userInfo as Record<string, unknown>,
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
  async function login<TCredentials = unknown, TUser = unknown>(
    options: LoginOptions<TCredentials, TUser>
  ): Promise<LoginResult<TUser>> {
    const {
      loginPath,
      credentials,
      userInfoPath,
      tokenExtractor = defaultTokenExtractor,
      sessionBuilder = defaultSessionBuilder,
      endpoint
    } = options

    const api = endpoint ? $api.use(endpoint) : $api

    // 1. 调用登录接口
    const loginResponse = await api.$fetch<ApiResponse>(loginPath, {
      method: 'POST',
      body: credentials as Record<string, unknown>
    })

    // 2. 提取 token
    const token = tokenExtractor(loginResponse)
    if (!token) {
      throw new Error('Login failed: token not found in response')
    }

    // 3. 获取用户信息
    let userInfo: TUser

    if (userInfoPath) {
      // 获取端点认证配置
      const endpointConfig = api.getConfig()
      const authConfig = endpointConfig.auth || moduleConfig.auth || {}

      // 使用 token 调用用户信息接口
      const headerName = getHeaderName(authConfig)
      const headerValue = buildAuthHeader(token, authConfig)

      const userResponse = await api.$fetch<ApiResponse<TUser>>(userInfoPath, {
        headers: { [headerName]: headerValue }
      })
      // 从响应中提取用户数据
      userInfo = (getPath(userResponse, 'data') ?? userResponse) as TUser
    }
    else {
      // 从登录响应中提取用户信息
      userInfo = (getPath(loginResponse, 'data') ?? loginResponse) as TUser
    }

    // 4. 构建 session 数据
    const sessionData = sessionBuilder(userInfo, token)

    // 5. 设置 session（通过服务端 API）
    await $fetch('/api/_movk/session', {
      method: 'POST',
      body: sessionData
    })

    // 6. 刷新客户端 session 状态
    await userSession.fetch()

    return { user: userInfo, token }
  }

  /**
   * 登出
   */
  async function logout(): Promise<void> {
    await userSession.clear()
  }

  /**
   * 刷新用户信息
   *
   * 重新调用用户信息接口，更新 session 中的 user 数据
   */
  async function refreshUser<TUser = unknown>(
    userInfoPath: string,
    endpoint?: string
  ): Promise<TUser> {
    const api = endpoint ? $api.use(endpoint) : $api

    // 获取用户信息
    const response = await api.$fetch<ApiResponse<TUser>>(userInfoPath)
    const userInfo = (getPath(response, 'data') ?? response) as TUser

    // 更新 session 中的 user 信息
    await $fetch('/api/_movk/session', {
      method: 'PATCH',
      body: { user: userInfo }
    })

    // 刷新客户端 session
    await userSession.fetch()

    return userInfo
  }

  /**
   * 刷新 session
   */
  async function refreshSession(): Promise<void> {
    await userSession.fetch()
  }

  return {
    login,
    logout,
    refreshUser,
    refreshSession,
    session: userSession.session as UseApiAuthReturn['session'],
    loggedIn: userSession.loggedIn,
    user: userSession.user as UseApiAuthReturn['user']
  }
}

export default useApiAuth
