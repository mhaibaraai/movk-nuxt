import type { $Fetch } from 'nitropack/types'
import type { CreateFetchOptions, FetchHook, FetchOptions } from 'ofetch'
import type { ApiClientDeps } from './report'
import { createOnRequest } from './interceptors/request'
import { createOnResponse } from './interceptors/response'
import { getErrorContext, toApiError } from './errors'
import { reportFailure } from './report'

type FetchImpl = typeof globalThis.fetch

/** nitro 的 $Fetch 类型只声明了单参 create，运行时（ofetch）支持第二个参数覆盖底层 fetch */
type CreateWithGlobals = (defaults: FetchOptions, globalOptions?: CreateFetchOptions) => $Fetch

function toArray<T>(value: T | T[] | undefined): T[] {
  if (value === undefined) return []
  return Array.isArray(value) ? value : [value]
}

/**
 * 创建单端点的 movk 客户端
 *
 * @description 包装一个不带默认钩子的 ofetch 实例：
 * - 每次调用把内置钩子排在用户钩子之前组合，用户传同名钩子不会覆盖内置拦截器
 * - 失败在出口归一为 ApiError 并上报一次：ofetch 重试结束后才进入 catch，网络错误与超时同样覆盖
 * - 传入 fetchImpl 时以其作为底层 fetch（如上传用的 XHR 适配器），缺省沿用全局 $fetch 的实现
 */
export function createApiClient(deps: ApiClientDeps, fetchImpl?: FetchImpl): $Fetch {
  const { endpoint, config } = deps
  const defaults = { baseURL: config.baseURL, headers: config.headers }
  const base = ($fetch.create as CreateWithGlobals)(defaults, fetchImpl ? { fetch: fetchImpl } : undefined)

  const onRequest = createOnRequest(deps)
  const onResponse = createOnResponse(deps)

  const withHooks = (options: FetchOptions = {}): FetchOptions => ({
    ...options,
    onRequest: [onRequest, ...toArray(options.onRequest)] as FetchHook[],
    onResponse: [onResponse, ...toArray(options.onResponse)] as FetchHook[]
  })

  const settle = async (error: unknown): Promise<unknown> => {
    const apiError = toApiError(error, endpoint, config.response)
    if (!apiError) return error
    await reportFailure(getErrorContext(error), apiError, deps)
    return apiError
  }

  const raw = async (request: Parameters<$Fetch['raw']>[0], options?: FetchOptions) => {
    try {
      return await base.raw(request, withHooks(options) as Parameters<$Fetch['raw']>[1])
    }
    catch (error) {
      throw await settle(error)
    }
  }

  const client = async (request: Parameters<$Fetch>[0], options?: FetchOptions) =>
    (await raw(request, options))._data

  return Object.assign(client, { raw, create: base.create }) as unknown as $Fetch
}
