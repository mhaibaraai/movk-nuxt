import { beforeEach, describe, expect, it, vi } from 'vitest'
import type { FetchContext } from 'ofetch'
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

const baseResolved: ResolvedEndpointConfig = {
  baseURL: '/api',
  auth: { enabled: false },
  toast: {
    enabled: true,
    success: { show: true, color: 'success', icon: 'i-lucide-circle-check' },
    error: { show: true, color: 'error', icon: 'i-lucide-circle-x' }
  },
  response: { successCodes: [0, 200], codeKey: 'code', messageKey: 'message', dataKey: 'data' }
}

const basePublic: MovkApiPublicConfig = {
  defaultEndpoint: 'default',
  debug: false,
  endpoints: { default: { baseURL: '/api' } }
}

function makeContext(raw: unknown, apiContext: Record<string, unknown> = {}, status = 200): FetchContext {
  return {
    request: '/x',
    options: { context: apiContext },
    response: { _data: raw, status, headers: new Headers() }
  } as unknown as FetchContext
}

const nuxtApp = {
  vueApp: { runWithContext: (fn: () => unknown) => fn() },
  runWithContext: (fn: () => unknown) => fn(),
  callHook
} as unknown as Parameters<typeof createOnResponse>[2]

describe('interceptors/response', () => {
  beforeEach(() => {
    toastAdd.mockClear()
    navigateToMock.mockClear()
    userSessionClear.mockClear()
    userSessionFetch.mockClear()
    callHook.mockReset()
  })

  it('业务成功时按 dataKey 解包并派发 movk:api:response', async () => {
    const onResponse = createOnResponse(baseResolved, basePublic, nuxtApp)
    const ctx = makeContext({ code: 0, data: { id: 1 } })

    await onResponse(ctx)

    expect(ctx.response!._data).toEqual({ id: 1 })
    expect(callHook).toHaveBeenCalledWith('movk:api:response', ctx)
  })

  it('skipBusinessCheck=true 时跳过 code 校验，仍按 dataKey 解包', async () => {
    const onResponse = createOnResponse(baseResolved, basePublic, nuxtApp)
    const ctx = makeContext({ code: 500, data: 'payload' }, { skipBusinessCheck: true })

    await onResponse(ctx)

    expect(ctx.response!._data).toBe('payload')
  })

  it('skipUnwrap=true 时保留原始响应（与 skipBusinessCheck 正交）', async () => {
    const onResponse = createOnResponse(baseResolved, basePublic, nuxtApp)
    const raw = { code: 0, data: { id: 1 } }
    const ctx = makeContext(raw, { skipUnwrap: true })

    await onResponse(ctx)

    expect(ctx.response!._data).toBe(raw)
  })

  it('响应体是流时整段短路：不解包、不弹 toast，仍派发 movk:api:response', async () => {
    const onResponse = createOnResponse(baseResolved, basePublic, nuxtApp)
    const body = new ReadableStream()
    const ctx = makeContext(body)

    await onResponse(ctx)

    expect(ctx.response!._data).toBe(body)
    expect(toastAdd).not.toHaveBeenCalled()
    expect(callHook).toHaveBeenCalledWith('movk:api:response', ctx)
  })

  it('业务失败时派发 movk:api:error 并抛 ApiError，message 取自响应', async () => {
    const onResponse = createOnResponse(baseResolved, basePublic, nuxtApp)
    const ctx = makeContext({ code: 40001, message: '业务异常' })

    await expect(onResponse(ctx)).rejects.toMatchObject({
      message: '业务异常',
      isBusinessError: true,
      statusCode: 40001
    })

    expect(callHook).toHaveBeenCalledWith('movk:api:error', ctx)
  })

  it('HTTP 4xx/5xx 响应不做业务校验，交由 onResponseError 处理', async () => {
    const onResponse = createOnResponse(baseResolved, basePublic, nuxtApp)
    const raw = { statusCode: 401, message: '未登录' }
    const ctx = makeContext(raw, {}, 401)

    await expect(onResponse(ctx)).resolves.toBeUndefined()

    expect(callHook).not.toHaveBeenCalled()
    expect(toastAdd).not.toHaveBeenCalled()
    expect(ctx.response?._data).toBe(raw)
  })

  describe('业务码 401', () => {
    const authResolved: ResolvedEndpointConfig = {
      ...baseResolved,
      auth: {
        enabled: true,
        unauthorized: { redirect: true, loginPath: '/login', clearSession: true }
      }
    }

    it('未被业务处理时：派发 unauthorized、清理会话、重定向，并派发 movk:api:error 后抛错', async () => {
      const onResponse = createOnResponse(authResolved, basePublic, nuxtApp)
      const ctx = makeContext({ code: 401, message: '登录已过期' })

      await expect(onResponse(ctx)).rejects.toMatchObject({ message: '登录已过期', statusCode: 401 })

      const hookNames = callHook.mock.calls.map(([name]) => name)
      expect(hookNames).toEqual(['movk:api:unauthorized', 'movk:api:error'])
      expect(userSessionClear).toHaveBeenCalled()
      expect(userSessionFetch).toHaveBeenCalled()
      expect(navigateToMock).toHaveBeenCalledWith('/login')
    })

    it('字符串业务码同样识别', async () => {
      const onResponse = createOnResponse(authResolved, basePublic, nuxtApp)

      await expect(onResponse(makeContext({ code: '401', message: 'x' }))).rejects.toBeDefined()

      expect(callHook.mock.calls.map(([name]) => name)).toContain('movk:api:unauthorized')
    })

    it('已被业务处理时：跳过默认处理与 movk:api:error，仍抛错', async () => {
      callHook.mockImplementation(async (name: unknown, _ctx: unknown, result?: unknown) => {
        if (name === 'movk:api:unauthorized') (result as { handled: boolean }).handled = true
      })
      const onResponse = createOnResponse(authResolved, basePublic, nuxtApp)

      await expect(onResponse(makeContext({ code: 401, message: 'x' }))).rejects.toBeDefined()

      expect(callHook.mock.calls.map(([name]) => name)).toEqual(['movk:api:unauthorized'])
      expect(userSessionClear).not.toHaveBeenCalled()
      expect(navigateToMock).not.toHaveBeenCalled()
    })
  })
})
