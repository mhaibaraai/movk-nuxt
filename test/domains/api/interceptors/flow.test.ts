import { beforeEach, describe, expect, it, vi } from 'vitest'
import { createFetch } from 'ofetch'
import type { ResolvedEndpointConfig } from '../../../../src/runtime/types/api/module'
import type { MovkApiPublicConfig } from '../../../../src/runtime/types/api'

const toastAdd = vi.fn()
const navigateToMock = vi.fn(async () => {})
const userSessionClear = vi.fn(async () => {})
const userSessionFetch = vi.fn(async () => {})
const callHook = vi.fn(async (..._args: unknown[]) => {})

vi.mock('#imports', () => ({
  useNuxtApp: () => ({
    vueApp: { runWithContext: (fn: () => unknown) => fn() },
    callHook
  }),
  useToast: () => ({ add: toastAdd }),
  navigateTo: navigateToMock
}))

vi.mock('#build/movk-session', () => ({
  useUserSession: () => ({ clear: userSessionClear, fetch: userSessionFetch })
}))

const { createOnResponse } = await import('../../../../src/runtime/domains/api/interceptors/response')
const { createOnResponseError } = await import('../../../../src/runtime/domains/api/interceptors/error')

const resolved: ResolvedEndpointConfig = {
  baseURL: '/api',
  auth: {
    enabled: true,
    unauthorized: { redirect: true, loginPath: '/login', clearSession: true }
  },
  toast: { enabled: true },
  response: { successCodes: [0, 200], codeKey: 'code', messageKey: 'message', dataKey: 'data' }
}

const publicConfig: MovkApiPublicConfig = {
  defaultEndpoint: 'default',
  debug: false,
  endpoints: { default: { baseURL: '/api' } }
}

const nuxtApp = {
  vueApp: { runWithContext: (fn: () => unknown) => fn() },
  runWithContext: (fn: () => unknown) => fn(),
  callHook
} as unknown as Parameters<typeof createOnResponse>[2]

/** 用真实 ofetch 串联两个拦截器，覆盖「onResponse 先于 onResponseError」的调用顺序 */
function createApi(status: number, body: unknown) {
  const $fetch = createFetch({
    fetch: async () => new Response(JSON.stringify(body), {
      status,
      headers: { 'content-type': 'application/json' }
    })
  })
  return $fetch.create({
    baseURL: 'http://localhost/api',
    // 关闭 ofetch 对 5xx 的默认重试，只观察单次请求的拦截器行为
    retry: 0,
    onResponse: createOnResponse(resolved, publicConfig, nuxtApp),
    onResponseError: createOnResponseError(resolved, publicConfig, nuxtApp)
  })
}

describe('interceptors 在真实 ofetch 中的串联', () => {
  beforeEach(() => {
    toastAdd.mockClear()
    navigateToMock.mockClear()
    userSessionClear.mockClear()
    userSessionFetch.mockClear()
    callHook.mockReset()
  })

  it('HTTP 401：走 onResponseError 的未授权处理（派发 hook、清理会话、重定向）', async () => {
    const api = createApi(401, { statusCode: 401, message: '未登录' })

    await expect(api('/protected')).rejects.toMatchObject({ statusCode: 401 })

    expect(callHook.mock.calls.map(([name]) => name)).toEqual(['movk:api:unauthorized', 'movk:api:error'])
    expect(userSessionClear).toHaveBeenCalled()
    expect(navigateToMock).toHaveBeenCalledWith('/login')
  })

  it('HTTP 500：仅派发一次 movk:api:error，错误 toast 只弹一次', async () => {
    const api = createApi(500, { statusCode: 500, message: '服务异常' })

    await expect(api('/boom')).rejects.toMatchObject({ statusCode: 500 })

    expect(callHook.mock.calls.map(([name]) => name)).toEqual(['movk:api:error'])
    expect(toastAdd).toHaveBeenCalledTimes(1)
  })

  it('HTTP 200 + 业务成功：解包数据', async () => {
    const api = createApi(200, { code: 0, data: { id: 1 } })

    await expect(api('/ok')).resolves.toEqual({ id: 1 })
  })
})
