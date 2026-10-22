import { beforeEach, describe, expect, it, vi } from 'vitest'
import type { FetchContext } from 'ofetch'
import type { ResolvedEndpointConfig } from '../../../../src/runtime/types/api/module'
import type { MovkApiPublicConfig } from '../../../../src/runtime/types/api'

const toastAdd = vi.fn()
const callHook = vi.fn(async (..._args: unknown[]) => {})

vi.mock('#imports', async () => ({
  ...await import('../../../helpers/nuxt-error'),
  useNuxtApp: () => ({
    vueApp: { runWithContext: (fn: () => unknown) => fn() },
    callHook
  }),
  useToast: () => ({ add: toastAdd }),
  navigateTo: vi.fn()
}))

vi.mock('#build/movk-session', () => ({ useUserSession: undefined }))

const { createOnResponse } = await import('../../../../src/runtime/domains/api/interceptors/response')
const { getErrorContext } = await import('../../../../src/runtime/domains/api/errors')

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

const nuxtApp = {
  vueApp: { runWithContext: (fn: () => unknown) => fn() },
  runWithContext: (fn: () => unknown) => fn(),
  callHook
} as unknown as Parameters<typeof createOnResponse>[0]['nuxtApp']

function create(config: Partial<ResolvedEndpointConfig> = {}) {
  return createOnResponse({ endpoint: 'default', config: { ...baseResolved, ...config }, publicConfig: basePublic, nuxtApp })
}

function makeContext(
  raw: unknown,
  options: Record<string, unknown> = {},
  init: { status?: number, contentType?: string, body?: string } = {}
): FetchContext {
  const response = new Response(init.body ?? null, {
    status: init.status ?? 200,
    headers: init.contentType ? { 'content-type': init.contentType } : {}
  }) as Response & { _data?: unknown }
  response._data = raw
  return { request: '/x', options, response } as unknown as FetchContext
}

describe('interceptors/response', () => {
  beforeEach(() => {
    toastAdd.mockClear()
    callHook.mockReset()
  })

  it('业务成功时按 dataKey 解包，派发 movk:api:response 并弹成功提示', async () => {
    const ctx = makeContext({ code: 0, message: '已保存', data: { id: 1 } })

    await create()(ctx)

    expect(ctx.response!._data).toEqual({ id: 1 })
    expect(callHook).toHaveBeenCalledWith('movk:api:response', ctx)
    expect(toastAdd).toHaveBeenCalledWith(expect.objectContaining({ title: '已保存' }))
  })

  it('请求 businessCheck=false 时跳过校验，仍按 dataKey 解包', async () => {
    const ctx = makeContext({ code: 500, data: 'payload' }, { businessCheck: false })

    await create()(ctx)

    expect(ctx.response!._data).toBe('payload')
  })

  it('请求 unwrap=false 时保留原始响应', async () => {
    const raw = { code: 0, data: { id: 1 } }
    const ctx = makeContext(raw, { unwrap: false })

    await create()(ctx)

    expect(ctx.response!._data).toBe(raw)
  })

  it('端点声明裸响应时数组原样返回', async () => {
    const raw = [{ point_number: 'DP201A_H' }]
    const ctx = makeContext(raw)

    await create({ response: { ...baseResolved.response, businessCheck: false, unwrap: false } })(ctx)

    expect(ctx.response!._data).toBe(raw)
  })

  it('请求显式 businessCheck=true 可重新开启端点关闭的校验', async () => {
    const onResponse = create({ response: { ...baseResolved.response, businessCheck: false, unwrap: false } })

    await expect(onResponse(makeContext([1, 2], { businessCheck: true }))).rejects.toMatchObject({
      data: { kind: 'business' }
    })
  })

  it('业务失败抛 ApiError，携带上下文且不在拦截器内上报', async () => {
    const ctx = makeContext({ code: 40001, message: '业务异常' })

    const error = await create()(ctx).catch((e: unknown) => e)

    expect(error).toMatchObject({
      message: '业务异常',
      statusCode: 500,
      data: { kind: 'business', endpoint: 'default', code: 40001, response: { code: 40001, message: '业务异常' } }
    })
    expect(getErrorContext(error)).toBe(ctx)
    expect(callHook).not.toHaveBeenCalled()
    expect(toastAdd).not.toHaveBeenCalled()
  })

  it('null / 字符串响应判为业务失败而非 TypeError', async () => {
    await expect(create()(makeContext(null))).rejects.toMatchObject({ data: { kind: 'business' } })
    await expect(create()(makeContext('ok'))).rejects.toMatchObject({ data: { kind: 'business' } })
  })

  it('真正的流整段短路：不解包、不弹 toast，仍派发 movk:api:response', async () => {
    const body = new ReadableStream()
    const ctx = makeContext(body, {}, { contentType: 'text/event-stream' })

    await create()(ctx)

    expect(ctx.response!._data).toBe(body)
    expect(toastAdd).not.toHaveBeenCalled()
    expect(callHook).toHaveBeenCalledWith('movk:api:response', ctx)
  })

  it('以流读取的 JSON 响应先还原再判定', async () => {
    const json = JSON.stringify({ code: 500, message: '网关异常' })
    const ctx = makeContext(undefined, {}, { contentType: 'application/json', body: json })
    ctx.response!._data = ctx.response!.body

    await expect(create()(ctx)).rejects.toMatchObject({ message: '网关异常', data: { kind: 'business', code: 500 } })
  })

  it('以流读取的 JSON 成功响应照常解包', async () => {
    const ctx = makeContext(undefined, {}, { contentType: 'application/json', body: JSON.stringify({ code: 0, data: [1] }) })
    ctx.response!._data = ctx.response!.body

    await create()(ctx)

    expect(ctx.response!._data).toEqual([1])
  })

  it('HTTP 4xx/5xx 响应不做判定，交由 ofetch 抛 FetchError', async () => {
    const raw = { message: '未登录' }
    const ctx = makeContext(raw, {}, { status: 401 })

    await expect(create()(ctx)).resolves.toBeUndefined()

    expect(callHook).not.toHaveBeenCalled()
    expect(ctx.response?._data).toBe(raw)
  })
})
