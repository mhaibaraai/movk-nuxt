import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { createFetch } from 'ofetch'
import type { MovkApiPublicConfig } from '../../src/runtime/types/api'

const toastAdd = vi.fn()
const callHook = vi.fn(async (..._args: unknown[]) => {})
const triggerDownloadMock = vi.fn()
const fetchMock = vi.fn<typeof globalThis.fetch>()

const basePublic: MovkApiPublicConfig = {
  defaultEndpoint: 'default',
  debug: false,
  endpoints: { default: { baseURL: 'http://localhost/api' } },
  auth: { enabled: false },
  toast: {
    enabled: true,
    success: { show: true, color: 'success', icon: 'i-lucide-circle-check' },
    error: { show: true, color: 'error', icon: 'i-lucide-circle-x' }
  },
  response: { successCodes: [0, 200], codeKey: 'code', messageKey: 'message', dataKey: 'data' }
}

const nuxtApp: Record<string, unknown> = {
  vueApp: { runWithContext: (fn: () => unknown) => fn() },
  runWithContext: (fn: () => unknown) => fn(),
  callHook
}

vi.mock('#imports', async () => ({
  ...await import('../helpers/nuxt-error'),
  useNuxtApp: () => nuxtApp,
  useToast: () => ({ add: toastAdd }),
  useRuntimeConfig: () => ({ public: { movkApi: basePublic } }),
  navigateTo: vi.fn()
}))

vi.mock('#build/movk-session', () => ({ useUserSession: undefined }))

vi.mock('@movk/core', async () => {
  const actual = await vi.importActual<typeof import('@movk/core')>('@movk/core')
  return { ...actual, triggerDownload: triggerDownloadMock }
})

const { createApiClient } = await import('../../src/runtime/domains/api/client')
const { resolveEndpointConfig } = await import('../../src/runtime/domains/api/endpoint-config')
const { useDownloadWithProgress } = await import('../../src/runtime/composables/useDownloadWithProgress')

function installApi(): void {
  const api = Object.assign(
    createApiClient({
      endpoint: 'default',
      config: resolveEndpointConfig(basePublic, 'default'),
      publicConfig: basePublic,
      nuxtApp: nuxtApp as never
    }),
    { use: () => api }
  )
  nuxtApp.$api = api
}

function streamOf(chunks: Uint8Array[]): ReadableStream<Uint8Array> {
  return new ReadableStream({
    start(controller) {
      chunks.forEach(chunk => controller.enqueue(chunk))
      controller.close()
    }
  })
}

function binary(chunks: Uint8Array[], headers: Record<string, string> = {}): Response {
  return new Response(streamOf(chunks), {
    status: 200,
    headers: { 'content-type': 'application/octet-stream', ...headers }
  })
}

function json(status: number, body: unknown): Response {
  return new Response(JSON.stringify(body), { status, headers: { 'content-type': 'application/json' } })
}

function hookNames(): unknown[] {
  return callHook.mock.calls.map(([name]) => name)
}

describe('useDownloadWithProgress', () => {
  beforeEach(() => {
    vi.stubGlobal('$fetch', createFetch({ fetch: fetchMock }))
    installApi()
    fetchMock.mockReset()
    toastAdd.mockClear()
    callHook.mockClear()
    triggerDownloadMock.mockClear()
  })

  afterEach(() => {
    vi.unstubAllGlobals()
  })

  it('二进制成功：触发下载、progress=100、成功提示、派发 movk:api:response', async () => {
    fetchMock.mockResolvedValue(binary([new Uint8Array([1, 2, 3, 4])], {
      'content-length': '4',
      'content-disposition': 'attachment; filename="a.bin"'
    }))
    const onSuccess = vi.fn()
    const { download, progress, status } = useDownloadWithProgress()

    const result = await download('/export', { onSuccess })

    expect(result.data).toBeInstanceOf(Blob)
    expect(result.error).toBeNull()
    expect(progress.value).toBe(100)
    expect(status.value).toBe('success')
    expect(triggerDownloadMock).toHaveBeenCalledWith(expect.any(Blob), 'a.bin')
    expect(onSuccess).toHaveBeenCalledWith('a.bin')
    expect(hookNames()).toContain('movk:api:response')
    expect(toastAdd).toHaveBeenCalledWith(expect.objectContaining({ title: '下载成功: a.bin' }))
  })

  it('无 content-length 时 progress 切到 null（不确定）', async () => {
    let close!: () => void
    const body = new ReadableStream<Uint8Array>({
      start(controller) {
        controller.enqueue(new Uint8Array([1]))
        close = () => controller.close()
      }
    })
    fetchMock.mockResolvedValue(new Response(body, { headers: { 'content-type': 'application/octet-stream' } }))
    const { download, progress } = useDownloadWithProgress()

    const promise = download('/export')
    await vi.waitFor(() => expect(progress.value).toBeNull())
    close()
    await promise

    expect(progress.value).toBe(100)
  })

  it('JSON 业务错误：不触发文件下载，返回 business ApiError 并上报', async () => {
    fetchMock.mockResolvedValue(json(200, { code: 50001, message: '导出失败' }))
    const onError = vi.fn()
    const { download, status } = useDownloadWithProgress()

    const result = await download('/export', { onError })

    expect(result.error).toMatchObject({ message: '导出失败', data: { kind: 'business', code: 50001 } })
    expect(status.value).toBe('error')
    expect(onError).toHaveBeenCalledWith(result.error)
    expect(triggerDownloadMock).not.toHaveBeenCalled()
    expect(hookNames()).toContain('movk:api:error')
  })

  it('JSON 业务成功：按策略解包为 data，不触发下载', async () => {
    fetchMock.mockResolvedValue(json(200, { code: 0, data: { taskId: 't1' } }))
    const { download } = useDownloadWithProgress<{ taskId: string }>()

    const result = await download('/export')

    expect(result.data).toEqual({ taskId: 't1' })
    expect(triggerDownloadMock).not.toHaveBeenCalled()
  })

  it('HTTP 错误：http ApiError 携带状态码，不重试', async () => {
    fetchMock.mockResolvedValue(json(503, { message: '维护中' }))
    const { download } = useDownloadWithProgress()

    const result = await download('/export')

    expect(result.error).toMatchObject({ statusCode: 503, message: '维护中', data: { kind: 'http' } })
    expect(fetchMock).toHaveBeenCalledTimes(1)
  })

  it('非 GET 时对象 body 由 ofetch 序列化为 JSON', async () => {
    fetchMock.mockResolvedValue(binary([new Uint8Array([1])]))
    const { download } = useDownloadWithProgress()

    await download('/export', { method: 'POST', body: { ids: [1, 2] } })

    const [, init] = fetchMock.mock.calls[0]!
    expect(init?.method).toBe('POST')
    expect(init?.body).toBe(JSON.stringify({ ids: [1, 2] }))
    expect(new Headers(init?.headers).get('content-type')).toBe('application/json')
  })

  it('abort 后 status=aborted、aborted=true、error=null 且不上报', async () => {
    fetchMock.mockImplementation((_, init) => new Promise((_, reject) => {
      init?.signal?.addEventListener('abort', () => reject(new DOMException('aborted', 'AbortError')))
    }))
    const onError = vi.fn()
    const { download, abort, status } = useDownloadWithProgress()

    const promise = download('/export', { onError })
    await vi.waitFor(() => expect(fetchMock).toHaveBeenCalled())
    abort()
    const result = await promise

    expect(result).toEqual({ data: null, error: null, aborted: true })
    expect(status.value).toBe('aborted')
    expect(onError).not.toHaveBeenCalled()
    expect(hookNames()).not.toContain('movk:api:error')
  })

  it('toast=false 时不触发 toast', async () => {
    fetchMock.mockResolvedValue(binary([new Uint8Array([1])]))
    const { download } = useDownloadWithProgress()

    await download('/export', { toast: false })

    expect(toastAdd).not.toHaveBeenCalled()
  })
})
