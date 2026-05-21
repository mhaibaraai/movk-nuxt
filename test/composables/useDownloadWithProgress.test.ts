import { beforeEach, describe, expect, it, vi } from 'vitest'
import type { MovkApiPublicConfig } from '../../src/runtime/types/api'

const toastAdd = vi.fn()
const callHook = vi.fn(async () => {})
const triggerDownloadMock = vi.fn()

const basePublic: MovkApiPublicConfig = {
  defaultEndpoint: 'default',
  debug: false,
  endpoints: { default: { baseURL: '/api' } },
  auth: { enabled: false },
  toast: {
    enabled: true,
    success: { show: true, color: 'success', icon: 'i-lucide-circle-check' },
    error: { show: true, color: 'error', icon: 'i-lucide-circle-x' }
  },
  response: { successCodes: [0, 200], codeKey: 'code', messageKey: 'message', dataKey: 'data' }
}

vi.mock('#imports', async () => {
  const { ref } = await import('vue')
  return {
    useNuxtApp: () => ({
      vueApp: { runWithContext: (fn: () => unknown) => fn() },
      callHook
    }),
    useToast: () => ({ add: toastAdd }),
    useRuntimeConfig: () => ({ public: { movkApi: basePublic } }),
    useUserSession: () => ({ session: { value: null } }),
    ref
  }
})

vi.mock('@movk/core', async () => {
  const actual = await vi.importActual<typeof import('@movk/core')>('@movk/core')
  return { ...actual, triggerDownload: triggerDownloadMock }
})

const { useDownloadWithProgress } = await import('../../src/runtime/composables/useDownloadWithProgress')

function makeReadable(chunks: Uint8Array[]): ReadableStream<Uint8Array> {
  let i = 0
  return new ReadableStream({
    pull(controller) {
      if (i < chunks.length) {
        controller.enqueue(chunks[i]!)
        i++
      }
      else controller.close()
    }
  })
}

function mockFetch(response: Response) {
  return vi.fn(async () => response)
}

describe('useDownloadWithProgress', () => {
  beforeEach(() => {
    toastAdd.mockClear()
    callHook.mockClear()
    triggerDownloadMock.mockClear()
  })

  it('二进制成功：触发下载、progress=100、status=success、派发 movk:api:response', async () => {
    const chunk = new Uint8Array([1, 2, 3, 4])
    const response = new Response(makeReadable([chunk]), {
      status: 200,
      headers: {
        'content-type': 'application/octet-stream',
        'content-length': '4',
        'content-disposition': 'attachment; filename="a.bin"'
      }
    })
    vi.stubGlobal('fetch', mockFetch(response))

    const { progress, status, download } = useDownloadWithProgress()
    const result = await download('/x')

    expect(result.error).toBeNull()
    expect(result.aborted).toBe(false)
    expect(status.value).toBe('success')
    expect(progress.value).toBe(100)
    expect(triggerDownloadMock).toHaveBeenCalledOnce()
    expect(triggerDownloadMock.mock.calls[0]![1]).toBe('a.bin')
    expect(callHook).toHaveBeenCalledWith('movk:api:response', expect.anything())
  })

  it('无 content-length 时 progress 切到 null（不确定）', async () => {
    let inflightProgress: number | null = 0
    const chunks = [new Uint8Array([1]), new Uint8Array([2])]
    const response = new Response(makeReadable(chunks), {
      status: 200,
      headers: { 'content-type': 'application/octet-stream' }
    })
    vi.stubGlobal('fetch', mockFetch(response))

    const { progress, download } = useDownloadWithProgress()

    // 在 download 进行中观察 progress，借助 microtask 时序
    const p = download('/x')
    // 等待第一帧到达
    await Promise.resolve()
    await Promise.resolve()
    inflightProgress = progress.value
    await p

    expect(inflightProgress).toBeNull()
  })

  it('JSON 业务错误：不触发文件下载，error 为 ApiError，派发 movk:api:error', async () => {
    const response = new Response(JSON.stringify({ code: 40001, message: '无权限' }), {
      status: 200,
      headers: { 'content-type': 'application/json' }
    })
    vi.stubGlobal('fetch', mockFetch(response))

    const onError = vi.fn()
    const { download } = useDownloadWithProgress()
    const result = await download('/x', { onError })

    expect(triggerDownloadMock).not.toHaveBeenCalled()
    expect(result.error).toMatchObject({ message: '无权限', isBusinessError: true })
    expect(onError).toHaveBeenCalled()
    expect(callHook).toHaveBeenCalledWith('movk:api:error', expect.anything())
  })

  it('HTTP 错误：error 包含 status', async () => {
    const response = new Response('server error', {
      status: 500,
      headers: { 'content-type': 'text/plain' }
    })
    vi.stubGlobal('fetch', mockFetch(response))

    const { download } = useDownloadWithProgress()
    const result = await download('/x')

    expect(result.error).toBeTruthy()
    expect(result.error!.message).toContain('500')
    expect(triggerDownloadMock).not.toHaveBeenCalled()
  })

  it('abort 后 status=aborted、aborted=true、error=null', async () => {
    vi.stubGlobal('fetch', vi.fn((_url, init: RequestInit) => {
      return new Promise((_, reject) => {
        init.signal?.addEventListener('abort', () => {
          reject(new DOMException('aborted', 'AbortError'))
        })
      })
    }))

    const { status, error, download, abort } = useDownloadWithProgress()
    const p = download('/x')
    abort()
    const result = await p

    expect(result.aborted).toBe(true)
    expect(result.error).toBeNull()
    expect(status.value).toBe('aborted')
    expect(error.value).toBeNull()
  })

  it('toast=false 时不触发 toast', async () => {
    const response = new Response(new Uint8Array([1]), {
      status: 200,
      headers: { 'content-type': 'application/octet-stream', 'content-length': '1' }
    })
    vi.stubGlobal('fetch', mockFetch(response))

    const { download } = useDownloadWithProgress()
    await download('/x', { toast: false })
    expect(toastAdd).not.toHaveBeenCalled()
  })
})
