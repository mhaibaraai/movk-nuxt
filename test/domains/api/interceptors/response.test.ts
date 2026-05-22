import { beforeEach, describe, expect, it, vi } from 'vitest'
import type { FetchContext } from 'ofetch'
import type { ResolvedEndpointConfig } from '../../../../src/runtime/types/api/module'
import type { MovkApiPublicConfig } from '../../../../src/runtime/types/api'

const toastAdd = vi.fn()
const callHook = vi.fn(async () => {})

vi.mock('#imports', () => ({
  useNuxtApp: () => ({
    vueApp: { runWithContext: (fn: () => unknown) => fn() },
    callHook
  }),
  useToast: () => ({ add: toastAdd })
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

function makeContext(raw: unknown, apiContext: Record<string, unknown> = {}): FetchContext {
  return {
    request: '/x',
    options: { context: apiContext },
    response: { _data: raw, status: 200, headers: new Headers() }
  } as unknown as FetchContext
}

const nuxtApp = {
  vueApp: { runWithContext: (fn: () => unknown) => fn() },
  callHook
} as unknown as Parameters<typeof createOnResponse>[2]

describe('interceptors/response', () => {
  beforeEach(() => {
    toastAdd.mockClear()
    callHook.mockClear()
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
})
