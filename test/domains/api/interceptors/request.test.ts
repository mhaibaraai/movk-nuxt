import { beforeEach, describe, expect, it, vi } from 'vitest'
import type { FetchContext } from 'ofetch'
import type { ResolvedEndpointConfig } from '../../../../src/runtime/types/api/module'
import type { MovkApiPublicConfig } from '../../../../src/runtime/types/api'

const callHook = vi.fn(async () => {})

vi.mock('#imports', () => ({
  useNuxtApp: () => ({
    vueApp: { runWithContext: (fn: () => unknown) => fn() },
    callHook
  }),
  useUserSession: () => ({ session: { value: { token: 'JWT-TEST' } } })
}))

const { createOnRequest } = await import('../../../../src/runtime/domains/api/interceptors/request')

const baseResolved: ResolvedEndpointConfig = {
  baseURL: '/api',
  auth: { enabled: true, tokenType: 'Bearer', headerName: 'Authorization', sessionTokenPath: 'token' },
  toast: { enabled: true },
  response: { successCodes: [0, 200] }
}

const basePublic: MovkApiPublicConfig = {
  defaultEndpoint: 'default',
  debug: false,
  endpoints: { default: { baseURL: '/api' } }
}

const nuxtApp = {
  vueApp: { runWithContext: (fn: () => unknown) => fn() },
  callHook
} as unknown as Parameters<typeof createOnRequest>[2]

function makeContext(initialHeaders?: HeadersInit | Record<string, string | undefined>): FetchContext {
  return {
    request: '/x',
    options: { headers: initialHeaders }
  } as unknown as FetchContext
}

describe('interceptors/request', () => {
  beforeEach(() => {
    callHook.mockClear()
  })

  it('认证启用时注入 Authorization', async () => {
    const onRequest = createOnRequest(baseResolved, basePublic, nuxtApp)
    const ctx = makeContext()

    await onRequest(ctx)

    const headers = ctx.options.headers as Headers
    expect(headers.get('Authorization')).toBe('Bearer JWT-TEST')
    expect(callHook).toHaveBeenCalledWith('movk:api:request', ctx)
  })

  it('Headers 重建时过滤 undefined 值，不抛 TypeError', async () => {
    const onRequest = createOnRequest(baseResolved, basePublic, nuxtApp)
    const ctx = makeContext({ 'X-Custom': 'v', 'X-Skip': undefined } as Record<string, string | undefined>)

    await expect(onRequest(ctx)).resolves.not.toThrow()

    const headers = ctx.options.headers as Headers
    expect(headers.get('X-Custom')).toBe('v')
    expect(headers.get('X-Skip')).toBeNull()
    expect(headers.get('Authorization')).toBe('Bearer JWT-TEST')
  })

  it('支持数组形态 HeadersInit', async () => {
    const onRequest = createOnRequest(baseResolved, basePublic, nuxtApp)
    const ctx = makeContext([['X-A', '1'], ['X-B', '2']])

    await onRequest(ctx)
    const headers = ctx.options.headers as Headers
    expect(headers.get('X-A')).toBe('1')
    expect(headers.get('X-B')).toBe('2')
  })

  it('支持 Headers 实例形态', async () => {
    const onRequest = createOnRequest(baseResolved, basePublic, nuxtApp)
    const existing = new Headers({ 'X-Existing': 'yes' })
    const ctx = makeContext(existing)

    await onRequest(ctx)
    const headers = ctx.options.headers as Headers
    expect(headers.get('X-Existing')).toBe('yes')
    expect(headers.get('Authorization')).toBe('Bearer JWT-TEST')
  })

  it('认证未启用时不注入 Authorization', async () => {
    const onRequest = createOnRequest({ ...baseResolved, auth: { enabled: false } }, basePublic, nuxtApp)
    const ctx = makeContext()

    await onRequest(ctx)
    const headers = ctx.options.headers
    expect(headers).toBeUndefined()
  })
})
