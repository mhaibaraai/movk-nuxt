import type { $Fetch, FetchHooks, FetchResponse, FetchContext } from 'ofetch'
import type {
  ApiClient,
  ApiResponse,
  ApiAuthConfig,
  ApiHooksConfig,
  ResolvedEndpointConfig,
  UploadOptions,
  DownloadOptions,
  ApiFetchContext,
  MovkApiPublicConfig,
  MovkApiPrivateConfig,
  ApiHooksRegistry
} from '../types/api'
import { getPath, triggerDownload, extractFilename } from '@movk/core'
import {
  showToast,
  isBusinessSuccess,
  extractMessage,
  extractToastMessage
} from '../utils/api-utils'
import { defineNuxtPlugin, navigateTo, useNuxtApp, useUserSession, useRuntimeConfig } from '#imports'
import defu from 'defu'

/**
 * 获取用户会话实例
 * @returns 用户会话对象或null（如果在不支持的上下文中调用）
 * @internal
 */
function getUserSession(): ReturnType<typeof useUserSession> | null {
  try {
    const nuxtApp = useNuxtApp()
    return nuxtApp.runWithContext(() => useUserSession()) as ReturnType<typeof useUserSession>
  }
  catch {
    return null
  }
}

/**
 * 从用户会话中提取认证令牌
 * @param tokenPath - 令牌在会话对象中的路径（支持点号分隔的嵌套路径）
 * @returns 令牌字符串或null
 * @internal
 */
function getTokenFromSession(tokenPath: string): string | null {
  const userSession = getUserSession()
  if (!userSession?.session?.value) return null

  const sessionData = userSession.session.value
  return (getPath(sessionData, tokenPath) as string) || null
}

/**
 * 构建认证请求头的值
 * @param token - 认证令牌
 * @param config - 认证配置
 * @returns 格式化的认证头值（如: "Bearer token123"）
 * @internal
 */
function buildAuthHeader(token: string, config: Partial<ApiAuthConfig>): string {
  const tokenType = config.tokenType === 'Custom'
    ? (config.customTokenType || '')
    : (config.tokenType || 'Bearer')

  return tokenType ? `${tokenType} ${token}` : token
}

/**
 * 处理401未授权响应
 * @param config - 认证配置
 * @internal
 */
async function handleUnauthorized(config: Partial<ApiAuthConfig>): Promise<void> {
  const userSession = getUserSession()
  const unauthorizedConfig = config.unauthorized

  if (unauthorizedConfig?.clearSession && userSession?.clear) {
    await userSession.clear()
    await userSession.fetch()
  }

  if (unauthorizedConfig?.redirect) {
    const loginPath = unauthorizedConfig.loginPath || '/login'
    const nuxtApp = useNuxtApp()
    await nuxtApp.runWithContext(() => navigateTo(loginPath))
  }
}

/**
 * 从 Fetch 上下文中提取自定义 API 上下文
 * @param context - Fetch请求上下文
 * @returns API请求的扩展上下文（包含toast、skipBusinessCheck等配置）
 * @internal
 */
function getApiFetchContext(context: FetchContext): ApiFetchContext {
  return (context.options as { context?: ApiFetchContext }).context || {}
}

/**
 * 从钩子注册表中解析用户钩子
 * @description 优先级：端点级钩子 > 全局钩子 > undefined
 * @param registry - 钩子注册表
 * @param endpointName - 端点名称
 * @param hookName - 钩子名称
 * @returns 用户钩子函数或 undefined
 * @internal
 */
function resolveUserHook<K extends keyof ApiHooksConfig>(
  registry: ApiHooksRegistry,
  endpointName: string,
  hookName: K
): ApiHooksConfig[K] | undefined {
  const endpointHooks = registry.endpoints.get(endpointName)
  return endpointHooks?.[hookName] ?? registry.global?.[hookName]
}

/**
 * 用用户钩子包装内置钩子
 * @description 每个包装后的钩子在执行时懒查询注册表，找到用户钩子则调用用户钩子（传入 builtin），否则直接调用内置钩子
 * @param builtinHooks - 内置钩子集合
 * @param endpointName - 端点名称（用于查找端点级钩子）
 * @param registry - 钩子注册表
 * @returns 包装后的钩子集合
 * @internal
 */
function wrapWithUserHooks(
  builtinHooks: FetchHooks,
  endpointName: string,
  registry: ApiHooksRegistry
): FetchHooks {
  const hookNames = ['onRequest', 'onRequestError', 'onResponse', 'onResponseError'] as const

  const wrapped: Record<string, (context: any) => Promise<void>> = {}

  for (const name of hookNames) {
    const builtin = builtinHooks[name] as ((ctx: any) => void | Promise<void>) | undefined

    wrapped[name] = async (context: any) => {
      const userHook = resolveUserHook(registry, endpointName, name)
      if (userHook) {
        await (userHook as any)(context, builtin || (() => {}))
      }
      else if (builtin) {
        await builtin(context)
      }
    }
  }

  return wrapped as unknown as FetchHooks
}

/**
 * 创建内置的请求生命周期钩子
 * @description 处理请求前认证、响应后Toast提示、业务状态码检查、401重定向等核心逻辑
 * @param resolvedConfig - 已解析的端点配置
 * @param publicConfig - 全局公共配置
 * @returns Fetch钩子集合（onRequest/onRequestError/onResponse/onResponseError）
 * @internal
 */
function createBuiltinHooks(
  resolvedConfig: ResolvedEndpointConfig,
  publicConfig: MovkApiPublicConfig
): FetchHooks {
  const { auth: authConfig, toast: toastConfig, response: responseConfig } = resolvedConfig

  return {
    onRequest(context) {
      if (authConfig.enabled) {
        const tokenPath = authConfig.sessionTokenPath || 'token'
        const token = getTokenFromSession(tokenPath)

        if (token) {
          const headerName = authConfig.headerName || 'Authorization'
          const headerValue = buildAuthHeader(token, authConfig)

          context.options.headers = context.options.headers || new Headers()
          if (context.options.headers instanceof Headers) {
            context.options.headers.set(headerName, headerValue)
          }
          else {
            (context.options.headers as Record<string, string>)[headerName] = headerValue
          }
        }
      }

      if (publicConfig.debug) {
        console.log('[Movk API] Request:', {
          method: context.options.method || 'GET',
          url: `${resolvedConfig.baseURL}${context.request}`,
          body: context.options.body ? '(body present)' : undefined
        })
      }
    },

    async onRequestError({ error }) {
      if (publicConfig.debug) {
        console.error('[Movk API] Request Error:', error)
      }
    },

    async onResponse(context) {
      const response = context.response
      const data = response._data as ApiResponse

      if (publicConfig.debug) {
        console.log('[Movk API] Response:', data)
      }

      if (!import.meta.client) return

      const { toast, skipBusinessCheck } = getApiFetchContext(context)
      const isSuccess = skipBusinessCheck || isBusinessSuccess(data, responseConfig)
      const message = extractMessage(data, responseConfig)

      if (isSuccess) {
        const successMessage = toast !== false ? (toast?.successMessage || message) : undefined
        showToast('success', successMessage, toast, toastConfig)
      }
    },

    async onResponseError(context) {
      const { response } = context

      if (response.status === 401) {
        await handleUnauthorized(authConfig)
      }

      if (publicConfig.debug) {
        console.error('[Movk API] Error:', response.status, response._data)
      }

      if (!import.meta.client) return

      const { toast } = getApiFetchContext(context)
      const data = response._data as ApiResponse | undefined
      const message = data ? extractMessage(data, responseConfig) : undefined
      const errorMessage = toast !== false
        ? (toast?.errorMessage || message || `请求失败 (${response.status})`)
        : undefined

      showToast('error', errorMessage, toast, toastConfig)
    }
  } as FetchHooks
}

/**
 * 创建 API 客户端实例
 * @param resolvedConfig - 已解析的端点配置
 * @param publicConfig - 全局公共配置
 * @param endpointName - 端点名称（用于解析用户钩子）
 * @param hooksRegistry - 钩子注册表
 * @param getOrCreateEndpoint - 获取或创建端点的工厂函数（用于实现 use() 方法）
 * @returns API客户端实例（包含 $fetch、use、download、upload、getConfig 方法）
 * @internal
 */
function createApiClient(
  resolvedConfig: ResolvedEndpointConfig,
  publicConfig: MovkApiPublicConfig,
  endpointName: string,
  hooksRegistry: ApiHooksRegistry,
  getOrCreateEndpoint: (name: string) => ApiClient
): ApiClient {
  const builtinHooks = createBuiltinHooks(resolvedConfig, publicConfig)
  resolvedConfig.builtinHooks = builtinHooks

  const effectiveHooks = wrapWithUserHooks(builtinHooks, endpointName, hooksRegistry)

  const $fetchInstance = $fetch.create({
    baseURL: resolvedConfig.baseURL,
    headers: resolvedConfig.headers,
    onRequest: effectiveHooks.onRequest,
    onRequestError: effectiveHooks.onRequestError,
    onResponse: effectiveHooks.onResponse,
    onResponseError: effectiveHooks.onResponseError
  }) as $Fetch

  /**
   * 下载文件
   * @param url - 下载地址
   * @param filename - 保存的文件名（可选，默认从响应头或URL提取）
   * @param options - 下载选项（包含toast配置和其他fetch选项）
   */
  const download = async (
    url: string,
    filename?: string,
    options: DownloadOptions = {}
  ): Promise<void> => {
    const { toast, ...fetchOptions } = options

    const response = await $fetchInstance.raw<Blob>(url, {
      ...fetchOptions,
      method: 'GET',
      responseType: 'blob' as any,
      context: { toast }
    }) as FetchResponse<Blob>

    if (!response._data) {
      throw new Error('下载失败: 未接收到数据')
    }

    const finalFilename = filename || extractFilename(response.headers, url.split('/').pop() || 'download')
    triggerDownload(response._data, finalFilename)

    if (import.meta.client && toast !== false) {
      const message = extractToastMessage(toast, 'success', `下载成功: ${finalFilename}`)
      showToast('success', message, toast, resolvedConfig.toast)
    }
  }

  /**
   * 上传文件
   * @param url - 上传地址
   * @param file - 文件对象、文件数组或FormData
   * @param options - 上传选项（包含fieldName、toast配置和其他fetch选项）
   * @returns API响应数据
   */
  const upload = async <T>(
    url: string,
    file: File | File[] | FormData,
    options: UploadOptions = {}
  ): Promise<ApiResponse<T>> => {
    const { toast, fieldName = 'file', ...fetchOptions } = options

    const formData = file instanceof FormData
      ? file
      : (() => {
          const fd = new FormData()
          const files = Array.isArray(file) ? file : [file]
          files.forEach(f => fd.append(fieldName, f))
          return fd
        })()

    return $fetchInstance<ApiResponse<T>>(url, {
      ...fetchOptions,
      method: 'POST',
      body: formData,
      context: { toast }
    })
  }

  return {
    $fetch: $fetchInstance,
    use: (endpoint: string) => getOrCreateEndpoint(endpoint),
    download,
    upload,
    getConfig: () => resolvedConfig
  }
}

export default defineNuxtPlugin(() => {
  const runtimeConfig = useRuntimeConfig()
  const publicConfig = runtimeConfig.public.movkApi as MovkApiPublicConfig
  const privateConfig = import.meta.server
    ? (runtimeConfig.movkApi as MovkApiPrivateConfig | undefined)
    : undefined

  const hooksRegistry: ApiHooksRegistry = {
    global: undefined,
    endpoints: new Map()
  }

  const endpointCache = new Map<string, ApiClient>()

  const getOrCreateEndpoint = (endpointName: string): ApiClient => {
    if (endpointCache.has(endpointName)) {
      return endpointCache.get(endpointName)!
    }

    const endpoints = publicConfig.endpoints || {}
    const endpointConfig = endpoints[endpointName]

    if (!endpointConfig) {
      console.warn(`[Movk API] Endpoint "${endpointName}" not found, using default`)
      return getOrCreateEndpoint(publicConfig.defaultEndpoint || 'default')
    }

    const privateEndpointConfig = privateConfig?.endpoints?.[endpointName]

    const resolvedConfig: ResolvedEndpointConfig = {
      ...endpointConfig,
      headers: privateEndpointConfig?.headers,
      auth: defu(endpointConfig.auth, publicConfig.auth) as ResolvedEndpointConfig['auth'],
      toast: defu(endpointConfig.toast, publicConfig.toast) as ResolvedEndpointConfig['toast'],
      response: defu(endpointConfig.response, publicConfig.response) as ResolvedEndpointConfig['response']
    }

    const client = createApiClient(resolvedConfig, publicConfig, endpointName, hooksRegistry, getOrCreateEndpoint)

    endpointCache.set(endpointName, client)
    return client
  }

  const defaultEndpoint = publicConfig.defaultEndpoint || 'default'
  const api = getOrCreateEndpoint(defaultEndpoint)

  return {
    provide: {
      api,
      _apiHooksRegistry: hooksRegistry
    }
  }
})
