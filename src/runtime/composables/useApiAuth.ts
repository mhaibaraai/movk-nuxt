import type {
  ApiResponse,
  ApiResponseConfig,
  ApiAuthConfig,
  LoginOptions,
  LoginResult,
  UseApiAuthReturn
} from '../types/api'
import { getPath } from '@movk/core'
import type { PartialByKeys } from '@movk/core'
import { useNuxtApp, useRuntimeConfig, useUserSession } from '#imports'
import type { User, UserSession } from '#auth-utils'

/**
 * API 认证 Composable
 *
 * 扩展 nuxt-auth-utils 的 useUserSession，添加 login() 方法处理完整登录流程。
 *
 * @returns 包含 login 方法的 UserSessionComposable
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
 * // 使用独立接口获取用户信息
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
 * ```
 */
export function useApiAuth(): UseApiAuthReturn {
  const { $api } = useNuxtApp()
  const userSession = useUserSession()
  const moduleConfig = useRuntimeConfig().public.movkApi

  const getAuthConfig = (endpointConfig?: ReturnType<typeof $api.getConfig>): Partial<ApiAuthConfig> => {
    return endpointConfig?.auth || moduleConfig.auth || {}
  }

  const buildAuthHeader = (token: string, authConfig: Partial<ApiAuthConfig>): string => {
    const tokenType = authConfig.tokenType === 'Custom'
      ? (authConfig.customTokenType || '')
      : (authConfig.tokenType || 'Bearer')
    return tokenType ? `${tokenType} ${token}` : token
  }

  const extractToken = <T>(response: ApiResponse<T>, authConfig: Partial<ApiAuthConfig>): string | undefined => {
    // 优先使用配置的路径
    const configuredPath = authConfig.sessionTokenPath
    if (configuredPath) {
      const token = getPath(response, configuredPath) ?? getPath(response, `data.${configuredPath}`)
      if (token) return token as string
    }
    // 降级到常见路径
    const fallbackPaths = ['data.token', 'data.accessToken', 'token', 'accessToken']
    for (const path of fallbackPaths) {
      const token = getPath(response, path)
      if (token) return token as string
    }
  }

  const extractUserData = <T>(response: ApiResponse<T>, responseConfig: Partial<ApiResponseConfig>): User => {
    const dataKey = responseConfig.dataKey || 'data'
    return (getPath(response, dataKey) ?? response) as User
  }

  const defaultSessionBuilder = (user: User, token: string): PartialByKeys<UserSession, 'id'> => ({
    user,
    token,
    loggedInAt: new Date().toISOString()
  })

  /**
   * 执行登录流程
   */
  async function login<LoginRData = unknown>(options: LoginOptions<LoginRData>): Promise<LoginResult<LoginRData>> {
    const {
      loginPath,
      credentials,
      userInfoPath,
      tokenExtractor,
      sessionBuilder = defaultSessionBuilder,
      sessionConfig,
      endpoint
    } = options

    const api = endpoint ? $api.use(endpoint) : $api
    const config = api.getConfig()
    const authConfig = getAuthConfig(config)
    const responseConfig = config.response || {}

    // 1. 调用登录接口
    const loginResponse = await api.$fetch<ApiResponse<LoginRData>>(loginPath, {
      method: 'POST',
      body: credentials as Record<string, unknown>
    })

    // 2. 提取 token
    const token = tokenExtractor?.(loginResponse) ?? extractToken(loginResponse, authConfig)
    if (!token) {
      throw new Error('Login failed: token not found in response')
    }

    // 3. 提取登录响应数据
    const loginData = extractUserData(loginResponse, responseConfig) as LoginRData

    // 4. 获取用户信息
    let userInfo: User
    if (userInfoPath) {
      const userResponse = await api.$fetch<ApiResponse<User>>(userInfoPath, {
        headers: { [authConfig.headerName || 'Authorization']: buildAuthHeader(token, authConfig) },
        context: { toast: false }
      })
      userInfo = extractUserData(userResponse, responseConfig)
    }
    else {
      userInfo = loginData as User
    }

    // 5. 构建 session 数据
    const sessionData = sessionBuilder(userInfo, token, loginData)

    // 6. 设置 session（通过服务端 API）
    await $fetch('/api/_movk/session', {
      method: 'POST',
      body: {
        session: sessionData,
        config: sessionConfig
      }
    })

    // 7. 刷新客户端 session 状态
    await userSession.fetch()

    return { user: userInfo, token, loginData }
  }

  return {
    login,
    ...userSession
  }
}
