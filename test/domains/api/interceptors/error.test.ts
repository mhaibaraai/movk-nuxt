import { beforeEach, describe, expect, it, vi } from 'vitest'
import type { FetchContext } from 'ofetch'
import type { ResolvedEndpointConfig } from '../../../../src/runtime/types/api/module'
import type { MovkApiPublicConfig } from '../../../../src/runtime/types/api'

const toastAdd = vi.fn()
const navigateToMock = vi.fn(async () => {})
const userSessionClear = vi.fn(async () => {})
const userSessionFetch = vi.fn(async () => {})

const hookCalls: Array<[string, unknown[]]> = []
const callHook = vi.fn(async (name: string, ...args: unknown[]) => {
  hookCalls.push([name, args])
})

vi.mock('#imports', () => ({
  useNuxtApp: () => ({
    vueApp: { runWithContext: (fn: () => unknown) => fn() },
    runWithContext: (fn: () => unknown) => fn(),
    callHook
  }),
  useToast: () => ({ add: toastAdd }),
  useUserSession: () => ({ clear: userSessionClear, fetch: userSessionFetch }),
  navigateTo: navigateToMock
}))

const { createOnResponseError } = await import('../../../../src/runtime/domains/api/interceptors/error')

const baseResolved: ResolvedEndpointConfig = {
  baseURL: '/api',
  auth: {
    enabled: true,
    unauthorized: { redirect: true, loginPath: '/login', clearSession: true }
  },
  toast: {
    enabled: true,
    success: { show: true, color: 'success' },
    error: { show: true, color: 'error' }
  },
  response: { successCodes: [0, 200], codeKey: 'code', messageKey: 'message', dataKey: 'data' }
}

const basePublic: MovkApiPublicConfig = {
  defaultEndpoint: 'default',
  debug: false,
  endpoints: { default: { baseURL: '/api' } }
}

function make401Context(handled: boolean): {
  ctx: FetchContext
  resultRef: { handled: boolean }
} {
  const resultRef = { handled }
  // 让 callHook 在收到 movk:api:unauthorized 时设置 result.handled
  callHook.mockImplementation(async (name: string, _ctx: unknown, result?: { handled: boolean }) => {
    hookCalls.push([name, []])
    if (name === 'movk:api:unauthorized' && result && handled) {
      result.handled = true
    }
  })

  const ctx = {
    request: '/x',
    options: { context: {} },
    response: { _data: { code: 401, message: '未登录' }, status: 401, headers: new Headers() }
  } as unknown as FetchContext

  return { ctx, resultRef }
}

const nuxtApp = {
  vueApp: { runWithContext: (fn: () => unknown) => fn() },
  runWithContext: (fn: () => unknown) => fn(),
  callHook
} as unknown as Parameters<typeof createOnResponseError>[2]

describe('interceptors/error', () => {
  beforeEach(() => {
    toastAdd.mockClear()
    navigateToMock.mockClear()
    userSessionClear.mockClear()
    userSessionFetch.mockClear()
    callHook.mockClear()
    hookCalls.length = 0
  })

  it('401 未被业务处理时：clearSession + 重定向 + 派发 movk:api:error', async () => {
    callHook.mockImplementation(async (name: string) => {
      hookCalls.push([name, []])
    })
    const onError = createOnResponseError(baseResolved, basePublic, nuxtApp)
    const ctx = {
      request: '/x',
      options: { context: {} },
      response: { _data: { code: 401, message: 'no auth' }, status: 401, headers: new Headers() }
    } as unknown as FetchContext

    await onError(ctx)

    expect(userSessionClear).toHaveBeenCalled()
    expect(navigateToMock).toHaveBeenCalledWith('/login')

    const hookNames = hookCalls.map(([n]) => n)
    expect(hookNames).toContain('movk:api:unauthorized')
    expect(hookNames).toContain('movk:api:error')
  })

  it('401 已被业务处理时（result.handled=true）：跳过默认 clearSession/重定向，不重复派发 movk:api:error', async () => {
    const { ctx } = make401Context(true)
    const onError = createOnResponseError(baseResolved, basePublic, nuxtApp)

    await onError(ctx)

    expect(userSessionClear).not.toHaveBeenCalled()
    expect(navigateToMock).not.toHaveBeenCalled()

    const hookNames = hookCalls.map(([n]) => n)
    expect(hookNames).toContain('movk:api:unauthorized')
    expect(hookNames).not.toContain('movk:api:error')
  })

  it('非 401 错误：跳过 unauthorized hook，仅派发 movk:api:error', async () => {
    callHook.mockImplementation(async (name: string) => {
      hookCalls.push([name, []])
    })
    const onError = createOnResponseError(baseResolved, basePublic, nuxtApp)
    const ctx = {
      request: '/x',
      options: { context: {} },
      response: { _data: { message: '服务异常' }, status: 500, headers: new Headers() }
    } as unknown as FetchContext

    await onError(ctx)

    const hookNames = hookCalls.map(([n]) => n)
    expect(hookNames).not.toContain('movk:api:unauthorized')
    expect(hookNames).toContain('movk:api:error')
    expect(navigateToMock).not.toHaveBeenCalled()
  })
})
