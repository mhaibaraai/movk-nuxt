import type { Ref, MaybeRefOrGetter } from 'vue'
import type { FetchError } from 'ofetch'
import type {
  ApiResponseBase,
  UseApiFetchOptions
} from '../types/api.d'
import type {
  ApiSuccessConfig,
  ApiToastConfig,
  MovkApiModuleOptions
} from '../schemas/api'
import { useFetch, useRuntimeConfig, useNuxtApp } from '#imports'

/**
 * useApiFetch 返回类型
 */
export interface UseApiFetchReturn<T> {
  data: Ref<T | null>
  error: Ref<FetchError<ApiResponseBase<unknown>> | null>
  pending: Ref<boolean>
  status: Ref<'idle' | 'pending' | 'success' | 'error'>
  refresh: () => Promise<void>
  execute: () => Promise<void>
  clear: () => void
}

/**
 * 判断响应是否成功
 */
function isSuccessResponse(
  response: ApiResponseBase<unknown>,
  successConfig: Partial<ApiSuccessConfig> = {}
): boolean {
  const merged = {
    successCodes: [200, 0],
    codeKey: 'code',
    ...successConfig
  }

  const code = response[merged.codeKey]
  return merged.successCodes.includes(code as number | string)
}

/**
 * 从响应中提取消息
 */
function extractMessage(
  response: ApiResponseBase<unknown>,
  messageKey = 'msg'
): string | undefined {
  return (response[messageKey] as string)
    || response.message
    || response.msg
}

/**
 * 自定义 API Fetch 组合式函数
 * 封装 useFetch，集成认证、Toast、数据解包等功能
 *
 * @example
 * ```ts
 * // 基础用法
 * const { data, pending, error } = await useApiFetch('/users')
 *
 * // 带配置
 * const { data } = await useApiFetch('/users', {
 *   method: 'POST',
 *   body: { name: 'test' },
 *   api: {
 *     toast: { successMessage: '创建成功' },
 *     unwrap: true // 自动解包 data 字段
 *   }
 * })
 *
 * // 使用不同端点
 * const { data } = await useApiFetch('/users', {
 *   endpoint: 'v2'
 * })
 * ```
 */
export function useApiFetch<T = unknown>(
  url: MaybeRefOrGetter<string>,
  options: UseApiFetchOptions<T> = {}
): UseApiFetchReturn<T> {
  const config = useRuntimeConfig().public.movkApi as MovkApiModuleOptions
  const nuxtApp = useNuxtApp()

  // 获取端点配置
  const endpointName = options.endpoint || config.defaultEndpoint || 'default'
  const endpoints = config.endpoints || {}
  const endpointConfig = endpoints[endpointName] || endpoints.default || { baseURL: '/api' }

  // 合并配置
  const successConfig: Partial<ApiSuccessConfig> = {
    ...config.success,
    ...endpointConfig.success
  }

  const toastConfig: Partial<ApiToastConfig> = {
    ...config.toast,
    ...endpointConfig.toast
  }

  const apiOptions = options.api || {}

  /**
   * 获取 Toast 实例
   */
  const getToast = () => {
    try {
      // @ts-expect-error - useToast 来自 @nuxt/ui
      return useToast?.()
    }
    catch {
      return null
    }
  }

  /**
   * 显示 Toast 提示
   */
  const showToast = (
    type: 'success' | 'error',
    message: string | undefined
  ) => {
    // 全局禁用
    if (!config.toast?.enabled) return
    // 端点禁用
    if (toastConfig.enabled === false) return
    // 请求禁用
    if (apiOptions.toast === false) return

    const toast = getToast()
    if (!toast) return

    const globalTypeConfig = config.toast?.[type]
    const endpointTypeConfig = toastConfig[type]
    const requestToast = apiOptions.toast

    // 检查是否显示
    if (globalTypeConfig?.show === false) return
    if (endpointTypeConfig?.show === false) return
    if (typeof requestToast === 'object' && requestToast[type] === false) return

    // 获取自定义消息
    const customMessage = typeof requestToast === 'object'
      ? (type === 'success' ? requestToast.successMessage : requestToast.errorMessage)
      : undefined

    const finalMessage = customMessage || message
    if (!finalMessage) return

    // 合并 Toast 配置
    const toastProps = {
      color: type === 'success' ? 'success' as const : 'error' as const,
      title: finalMessage,
      duration: type === 'success' ? 3000 : 5000,
      ...globalTypeConfig,
      ...endpointTypeConfig,
      ...(typeof requestToast === 'object' && typeof requestToast[type] === 'object' ? requestToast[type] : {})
    }

    toast.add(toastProps)
  }

  // 构建 useFetch 选项
  const fetchOptions = {
    ...options,
    baseURL: endpointConfig.baseURL,
    timeout: apiOptions.timeout || endpointConfig.timeout,
    retry: apiOptions.retry,

    // 使用 $api 实例
    $fetch: nuxtApp.$api?.raw as typeof $fetch,

    // 响应转换
    transform: (response: unknown) => {
      const apiResponse = response as ApiResponseBase<T>

      // 检查业务状态码
      if (!isSuccessResponse(apiResponse, successConfig)) {
        const errorMessage = extractMessage(apiResponse, successConfig.messageKey)
        showToast('error', errorMessage)
        throw new Error(errorMessage || '请求失败')
      }

      // 显示成功提示
      const successMessage = extractMessage(apiResponse, successConfig.messageKey)
      showToast('success', successMessage)

      // 自定义转换
      if (apiOptions.transform) {
        return apiOptions.transform(apiResponse)
      }

      // 解包数据
      if (apiOptions.unwrap !== false) {
        const dataKey = successConfig.dataKey || 'data'
        return (apiResponse[dataKey] ?? apiResponse.result ?? apiResponse) as T
      }

      return apiResponse as unknown as T
    },

    // 错误处理
    onResponseError({ response }: { response: { _data?: unknown, status: number } }) {
      const errorData = response._data as ApiResponseBase<unknown> | undefined
      const errorMessage = errorData
        ? extractMessage(errorData, successConfig.messageKey)
        : `请求失败: ${response.status}`

      showToast('error', errorMessage)
    }
  }

  // 移除 api 和 endpoint 选项，避免传递给 useFetch
  delete (fetchOptions as Record<string, unknown>).api
  delete (fetchOptions as Record<string, unknown>).endpoint

  // @ts-expect-error - useFetch 类型比较复杂，这里使用类型断言
  const result = useFetch(url, fetchOptions)

  return {
    data: result.data as Ref<T | null>,
    error: result.error as Ref<FetchError<ApiResponseBase<unknown>> | null>,
    pending: result.pending,
    status: result.status,
    refresh: result.refresh,
    execute: result.execute,
    clear: result.clear
  }
}

/**
 * Lazy 版本的 useApiFetch
 * 不会在服务端渲染时执行
 */
export function useLazyApiFetch<T = unknown>(
  url: MaybeRefOrGetter<string>,
  options: UseApiFetchOptions<T> = {}
): UseApiFetchReturn<T> {
  return useApiFetch<T>(url, {
    ...options,
    lazy: true
  })
}

/**
 * 创建类型安全的 API Fetch
 * 用于定义接口时获得更好的类型推断
 *
 * @example
 * ```ts
 * interface User {
 *   id: number
 *   name: string
 * }
 *
 * const { data } = await useTypedApiFetch<User>('/user/1')
 * // data 类型为 Ref<User | null>
 * ```
 */
export function useTypedApiFetch<T>() {
  return <R = T>(
    url: MaybeRefOrGetter<string>,
    options: UseApiFetchOptions<R> = {}
  ) => useApiFetch<R>(url, options)
}

export default useApiFetch
