import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import type { FetchContext } from 'ofetch'
import { createFetch } from 'ofetch'
import type { ResolvedEndpointConfig } from '../../../src/runtime/types/api/module'
import type { ApiError, MovkApiPublicConfig } from '../../../src/runtime/types/api'

const toastAdd = vi.fn()
const navigateToMock = vi.fn(async () => {})
const userSessionClear = vi.fn(async () => {})
const callHook = vi.fn(async (..._args: unknown[]) => {})

vi.mock('#imports', async () => ({
  ...await import('../../helpers/nuxt-error'),
  useNuxtApp: () => ({
    runWithContext: (fn: () => unknown) => fn(),
    callHook
  }),
  useToast: () => ({ add: toastAdd }),
  navigateTo: navigateToMock
}))

vi.mock('#build/movk-session', () => ({
  useUserSession: () => ({ clear: userSessionClear, fetch: vi.fn(async () => {}) })
}))

const { createApiClient } = await import('../../../src/runtime/domains/api/client')

const config: ResolvedEndpointConfig = {
  baseURL: 'http://localhost/api',
  auth: { enabled: true, unauthorized: { redirect: true, loginPath: '/login', clearSession: true } },
  toast: { enabled: true, success: { show: false }, error: { show: true } },
  response: { successCodes: [0, 200], codeKey: 'code', messageKey: 'message', dataKey: 'data' }
}

const publicConfig: MovkApiPublicConfig = {
  defaultEndpoint: 'default',
  debug: false,
  endpoints: { default: { baseURL: 'http://localhost/api' } }
}

const nuxtApp = {
  runWithContext: (fn: () => unknown) => fn(),
  runWithContext: (fn: () => unknown) => fn(),
  callHook
} as unknown as Parameters<typeof createApiClient>[0]['nuxtApp']

const fetchMock = vi.fn<typeof globalThis.fetch>()

function json(status: number, body: unknown): Response {
  return new Response(JSON.stringify(body), { status, headers: { 'content-type': 'application/json' } })
}

function createClient(overrides: Partial<ResolvedEndpointConfig> = {}) {
  return createApiClient({ endpoint: 'default', config: { ...config, ...overrides }, publicConfig, nuxtApp })
}

function hookNames(): unknown[] {
  return callHook.mock.calls.map(([name]) => name)
}

describe('domains/api/client', () => {
  beforeEach(() => {
    vi.stubGlobal('$fetch', createFetch({ fetch: fetchMock }))
    fetchMock.mockReset()
    toastAdd.mockClear()
    navigateToMock.mockClear()
    userSessionClear.mockClear()
    callHook.mockReset()
  })

  afterEach(() => {
    vi.unstubAllGlobals()
  })

  describe('钩子组合', () => {
    it('用户 onResponse 不覆盖内置解包，且拿到解包后的数据', async () => {
      fetchMock.mockResolvedValue(json(200, { code: 0, data: { id: 1 } }))
      const seen: unknown[] = []

      const data = await createClient()('/users', {
        onResponse: ({ response }) => { seen.push(response?._data) }
      })

      expect(data).toEqual({ id: 1 })
      expect(seen).toEqual([{ id: 1 }])
    })

    it('raw 同样走内置管线', async () => {
      fetchMock.mockResolvedValue(json(200, { code: 0, data: 'x' }))

      const response = await createClient().raw('/users')

      expect(response._data).toBe('x')
    })

    it('用户钩子内抛出的错误原样抛出且不上报', async () => {
      fetchMock.mockResolvedValue(json(200, { code: 0, data: 'x' }))
      const boom = new TypeError('boom')

      await expect(createClient()('/users', { onRequest: () => { throw boom } })).rejects.toBe(boom)
      expect(hookNames()).not.toContain('movk:api:error')
    })
  })

  describe('失败只上报一次', () => {
    it('GET 500 经默认重试后只派发一次 error hook 与一次 toast', async () => {
      fetchMock.mockImplementation(async () => json(500, { message: '服务异常' }))

      const error = await createClient()('/users').catch((e: unknown) => e) as ApiError

      expect(fetchMock).toHaveBeenCalledTimes(2)
      expect(error.data).toMatchObject({ kind: 'http', code: 500 })
      expect(hookNames().filter(name => name === 'movk:api:error')).toHaveLength(1)
      expect(toastAdd).toHaveBeenCalledTimes(1)
      expect(toastAdd).toHaveBeenCalledWith(expect.objectContaining({ title: '服务异常' }))
    })

    it('error hook 收到上下文与归一后的错误', async () => {
      fetchMock.mockResolvedValue(json(400, { message: 'bad' }))

      await createClient()('/users', { method: 'POST' }).catch(() => {})

      const call = callHook.mock.calls.find(([name]) => name === 'movk:api:error')!
      expect((call[1] as FetchContext).request).toBe('http://localhost/api/users')
      expect((call[2] as ApiError).data).toMatchObject({ kind: 'http', code: 400, endpoint: 'default' })
    })

    it('业务失败经出口上报', async () => {
      fetchMock.mockResolvedValue(json(200, { code: 40001, message: '业务异常' }))

      await expect(createClient()('/users')).rejects.toMatchObject({ data: { kind: 'business', code: 40001 } })
      expect(hookNames()).toEqual(['movk:api:request', 'movk:api:error'])
      expect(toastAdd).toHaveBeenCalledWith(expect.objectContaining({ title: '业务异常' }))
    })

    it('网络错误归为 network 并上报', async () => {
      fetchMock.mockRejectedValue(new TypeError('Failed to fetch'))

      await expect(createClient()('/users', { retry: false })).rejects.toMatchObject({ data: { kind: 'network' } })
      expect(hookNames()).toContain('movk:api:error')
      expect(toastAdd).toHaveBeenCalledWith(expect.objectContaining({ title: '网络错误' }))
    })

    it('主动中止归为 aborted 且不上报', async () => {
      fetchMock.mockRejectedValue(new DOMException('aborted', 'AbortError'))

      await expect(createClient()('/users')).rejects.toMatchObject({ data: { kind: 'aborted' } })
      expect(hookNames()).not.toContain('movk:api:error')
      expect(toastAdd).not.toHaveBeenCalled()
    })

    it('请求级 toast=false 时失败不弹提示', async () => {
      fetchMock.mockResolvedValue(json(400, { message: 'bad' }))

      await createClient()('/users', { toast: false }).catch(() => {})

      expect(toastAdd).not.toHaveBeenCalled()
    })
  })

  describe('401 处理', () => {
    it.each([
      ['HTTP 401', () => json(401, { message: '未登录' })],
      ['业务码 401', () => json(200, { code: 401, message: '未登录' })],
      ['字符串业务码 401', () => json(200, { code: '401', message: '未登录' })]
    ])('%s：派发 unauthorized、清理会话、重定向，再派发 error', async (_, respond) => {
      fetchMock.mockResolvedValue(respond())

      await expect(createClient()('/me')).rejects.toMatchObject({ statusCode: 401 })

      expect(hookNames()).toEqual(['movk:api:request', 'movk:api:unauthorized', 'movk:api:error'])
      expect(userSessionClear).toHaveBeenCalled()
      expect(navigateToMock).toHaveBeenCalledWith('/login')
    })

    it('业务侧接管后跳过默认处理与 error hook', async () => {
      fetchMock.mockResolvedValue(json(401, {}))
      callHook.mockImplementation(async (name: unknown, _ctx: unknown, result?: unknown) => {
        if (name === 'movk:api:unauthorized') (result as { handled: boolean }).handled = true
      })

      await expect(createClient()('/me')).rejects.toBeDefined()

      expect(hookNames()).toEqual(['movk:api:request', 'movk:api:unauthorized'])
      expect(userSessionClear).not.toHaveBeenCalled()
      expect(navigateToMock).not.toHaveBeenCalled()
    })
  })

  it('自定义底层 fetch 时请求经该实现发出', async () => {
    const custom = vi.fn<typeof globalThis.fetch>(async () => json(200, { code: 0, data: 'via-custom' }))

    const client = createApiClient({ endpoint: 'default', config, publicConfig, nuxtApp }, custom)

    await expect(client('/upload')).resolves.toBe('via-custom')
    expect(custom).toHaveBeenCalled()
    expect(fetchMock).not.toHaveBeenCalled()
  })
})
