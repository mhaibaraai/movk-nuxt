import { beforeEach, describe, expect, it, vi } from 'vitest'
import type { FetchContext } from 'ofetch'
import type { MovkApiPublicConfig } from '../../../src/runtime/types/api'
import type { ResolvedEndpointConfig } from '../../../src/runtime/types/api/module'

const toastAdd = vi.fn()
const callHook = vi.fn(async () => {})

vi.mock('#imports', () => ({
  useNuxtApp: () => ({
    vueApp: { runWithContext: (fn: () => unknown) => fn() },
    callHook
  }),
  useToast: () => ({ add: toastAdd }),
  useUserSession: () => ({ session: { value: null } })
}))

const {
  prepareTransfer,
  resolveFilename,
  tryParseJsonResponse,
  parseXhrHeaders,
  finalizeTransfer,
  buildFetchContext
} = await import('../../../src/runtime/domains/api/transfer')

const baseConfig: ResolvedEndpointConfig = {
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
  endpoints: { default: { baseURL: '/api' } },
  auth: { enabled: false },
  toast: baseConfig.toast,
  response: baseConfig.response
}

const nuxtApp = {
  callHook,
  vueApp: { runWithContext: (fn: () => unknown) => fn() }
} as unknown as Parameters<typeof finalizeTransfer>[0]

function makeCtx(): FetchContext {
  return buildFetchContext('/x', {}, { status: 200, headers: new Headers(), _data: undefined })
}

describe('domains/api/transfer', () => {
  beforeEach(() => {
    toastAdd.mockClear()
    callHook.mockClear()
  })

  describe('prepareTransfer', () => {
    it('拼接 baseURL + url 并合并 headers，用户 headers 覆盖 auth', () => {
      const prepared = prepareTransfer(basePublic, '/upload', {
        headers: { 'X-Custom': 'a', 'Authorization': 'user-override' }
      })
      expect(prepared.fullUrl).toBe('/api/upload')
      expect(prepared.headers['X-Custom']).toBe('a')
      expect(prepared.headers.Authorization).toBe('user-override')
    })

    it('未指定 endpoint 时回退到 defaultEndpoint', () => {
      const prepared = prepareTransfer(basePublic, '/x', {})
      expect(prepared.config.baseURL).toBe('/api')
    })
  })

  describe('resolveFilename', () => {
    it('override 优先级最高', () => {
      const headers = new Headers({ 'content-disposition': 'attachment; filename="server.txt"' })
      expect(resolveFilename(headers, '/x/a.txt', 'override.bin')).toBe('override.bin')
    })

    it('无 override 时取 content-disposition', () => {
      const headers = new Headers({ 'content-disposition': 'attachment; filename="report.pdf"' })
      expect(resolveFilename(headers, '/x/a.txt')).toBe('report.pdf')
    })

    it('无 header 时回退到 URL pathname 末段（去除 query）', () => {
      const headers = new Headers()
      expect(resolveFilename(headers, '/api/export?token=abc')).toBe('export')
    })

    it('全部缺失时回退到 download', () => {
      expect(resolveFilename(new Headers(), '/')).toBe('download')
    })
  })

  describe('tryParseJsonResponse', () => {
    it('content-type 为 application/json 时解析', () => {
      const headers = new Headers({ 'content-type': 'application/json; charset=utf-8' })
      const result = tryParseJsonResponse(headers, '{"code":0,"data":{"id":1}}')
      expect(result).toEqual({ code: 0, data: { id: 1 } })
    })

    it('非 JSON content-type 返回 null', () => {
      const headers = new Headers({ 'content-type': 'application/octet-stream' })
      expect(tryParseJsonResponse(headers, '{"code":0}')).toBeNull()
    })

    it('解析失败返回 null', () => {
      const headers = new Headers({ 'content-type': 'application/json' })
      expect(tryParseJsonResponse(headers, 'not json')).toBeNull()
    })
  })

  describe('parseXhrHeaders', () => {
    it('解析多行 header 字符串', () => {
      const raw = 'content-type: application/json\r\nx-id: abc\r\n'
      const headers = parseXhrHeaders(raw)
      expect(headers.get('content-type')).toBe('application/json')
      expect(headers.get('x-id')).toBe('abc')
    })
  })

  describe('finalizeTransfer', () => {
    it('JSON 业务成功：解包 data、派发 movk:api:response、返回成功结果', async () => {
      const ctx = makeCtx()
      const result = await finalizeTransfer(nuxtApp, {
        raw: { code: 0, data: { ok: true } },
        config: baseConfig,
        publicConfig: basePublic,
        requestToast: undefined,
        fetchContext: ctx
      })
      expect(result).toEqual({ data: { ok: true }, error: null, aborted: false })
      expect(callHook).toHaveBeenCalledWith('movk:api:response', ctx)
      expect(toastAdd).toHaveBeenCalled()
    })

    it('JSON 业务失败：派发 movk:api:error、返回 ApiError', async () => {
      const ctx = makeCtx()
      const result = await finalizeTransfer(nuxtApp, {
        raw: { code: 40001, message: '业务异常' },
        config: baseConfig,
        publicConfig: basePublic,
        requestToast: undefined,
        fetchContext: ctx
      })
      expect(result.data).toBeNull()
      expect(result.error).toMatchObject({ message: '业务异常', isBusinessError: true, statusCode: 40001 })
      expect(callHook).toHaveBeenCalledWith('movk:api:error', ctx)
    })

    it('skipBusinessCheck 时跳过 code 校验，data 取 raw 全量', async () => {
      const ctx = makeCtx()
      const result = await finalizeTransfer(nuxtApp, {
        raw: { code: 500, data: 'x' },
        config: baseConfig,
        publicConfig: basePublic,
        requestToast: undefined,
        skipBusinessCheck: true,
        fetchContext: ctx
      })
      expect(result.error).toBeNull()
    })

    it('纯二进制成功：fallback isSuccess=true，data 来自 fallback', async () => {
      const ctx = makeCtx()
      const blob = new Blob(['x'])
      const result = await finalizeTransfer<Blob>(nuxtApp, {
        raw: null,
        fallback: { isSuccess: true, data: blob },
        config: baseConfig,
        publicConfig: basePublic,
        requestToast: 'success-only' as unknown as undefined,
        fetchContext: ctx
      })
      expect(result.data).toBe(blob)
      expect(callHook).toHaveBeenCalledWith('movk:api:response', ctx)
    })

    it('toast=false 时不触发 toast.add', async () => {
      const ctx = makeCtx()
      await finalizeTransfer(nuxtApp, {
        raw: { code: 0, data: 1 },
        config: baseConfig,
        publicConfig: basePublic,
        requestToast: false,
        fetchContext: ctx
      })
      expect(toastAdd).not.toHaveBeenCalled()
    })
  })
})
