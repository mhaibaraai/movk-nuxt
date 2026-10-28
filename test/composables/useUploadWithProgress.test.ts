import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { createFetch } from 'ofetch'
import type { MovkApiPublicConfig } from '../../src/runtime/types/api'
import { MockXHR, nextXhr } from '../helpers/mock-xhr'

const toastAdd = vi.fn()
const callHook = vi.fn(async (..._args: unknown[]) => {})

const basePublic: MovkApiPublicConfig = {
  defaultEndpoint: 'default',
  debug: false,
  endpoints: {
    default: { baseURL: '/api' },
    tenant: { baseURL: '/tenant', publicHeaders: { 'X-Tenant': 't1' } }
  },
  auth: { enabled: false },
  toast: {
    enabled: true,
    success: { show: true, color: 'success', icon: 'i-lucide-circle-check' },
    error: { show: true, color: 'error', icon: 'i-lucide-circle-x' }
  },
  response: { successCodes: [0, 200], codeKey: 'code', messageKey: 'message', dataKey: 'data' }
}

vi.mock('#imports', async () => ({
  ...await import('../helpers/nuxt-error'),
  useNuxtApp: () => ({
    runWithContext: (fn: () => unknown) => fn(),
    runWithContext: (fn: () => unknown) => fn(),
    callHook
  }),
  useToast: () => ({ add: toastAdd }),
  useRuntimeConfig: () => ({ public: { movkApi: basePublic } }),
  navigateTo: vi.fn()
}))

vi.mock('#build/movk-session', () => ({ useUserSession: undefined }))

const { useUploadWithProgress } = await import('../../src/runtime/composables/useUploadWithProgress')

function hookNames(): unknown[] {
  return callHook.mock.calls.map(([name]) => name)
}

describe('useUploadWithProgress', () => {
  beforeEach(() => {
    toastAdd.mockClear()
    callHook.mockClear()
    MockXHR.instances = []
    vi.stubGlobal('$fetch', createFetch())
    vi.stubGlobal('XMLHttpRequest', MockXHR as unknown as typeof XMLHttpRequest)
  })

  afterEach(() => {
    vi.useRealTimers()
    vi.unstubAllGlobals()
  })

  it('上传成功：按 dataKey 解包、status=success、派发 movk:api:response', async () => {
    const onSuccess = vi.fn()
    const { upload, data, status } = useUploadWithProgress<{ id: number }>()

    const promise = upload('/upload', new File(['x'], 'a.txt'), { onSuccess })
    const xhr = await nextXhr()
    expect(xhr.method).toBe('POST')
    expect(xhr.url).toBe('/api/upload')
    expect(xhr.body).toBeInstanceOf(FormData)
    xhr.respond({ code: 0, data: { id: 9 } })
    const result = await promise

    expect(result).toEqual({ data: { id: 9 }, error: null, aborted: false })
    expect(data.value).toEqual({ id: 9 })
    expect(status.value).toBe('success')
    expect(onSuccess).toHaveBeenCalledWith({ id: 9 })
    expect(hookNames()).toEqual(['movk:api:request', 'movk:api:response'])
  })

  it('进度事件更新 progress', async () => {
    const { upload, progress } = useUploadWithProgress()

    const promise = upload('/upload', new File(['x'], 'a.txt'))
    const xhr = await nextXhr()
    xhr.triggerUploadProgress(50, 100)
    expect(progress.value).toBe(50)
    xhr.respond({ code: 0, data: 1 })
    await promise

    expect(progress.value).toBe(100)
  })

  it('业务失败：返回 business ApiError、派发 movk:api:error', async () => {
    const onError = vi.fn()
    const { upload, status, error } = useUploadWithProgress()

    const promise = upload('/upload', new File(['x'], 'a.txt'), { onError })
    ;(await nextXhr()).respond({ code: 40001, message: '文件过大' })
    const result = await promise

    expect(result.error).toMatchObject({ message: '文件过大', data: { kind: 'business', code: 40001 } })
    expect(error.value).toBe(result.error)
    expect(status.value).toBe('error')
    expect(onError).toHaveBeenCalledWith(result.error)
    expect(hookNames()).toContain('movk:api:error')
  })

  it('HTTP 错误：http ApiError 携带状态码，不重试', async () => {
    const { upload } = useUploadWithProgress()

    const promise = upload('/upload', new File(['x'], 'a.txt'))
    ;(await nextXhr()).respond({ message: '服务异常' }, 500)
    const result = await promise

    expect(result.error).toMatchObject({ statusCode: 500, data: { kind: 'http', code: 500 } })
    expect(MockXHR.instances).toHaveLength(1)
  })

  it('网络错误：network ApiError 并触发 onError', async () => {
    const onError = vi.fn()
    const { upload } = useUploadWithProgress()

    const promise = upload('/upload', new File(['x'], 'a.txt'), { onError })
    ;(await nextXhr()).dispatch('error')
    const result = await promise

    expect(result.error?.data?.kind).toBe('network')
    expect(onError).toHaveBeenCalled()
  })

  it('abort：aborted=true、status=aborted、不触发 onError 与上报', async () => {
    const onError = vi.fn()
    const { upload, abort, status } = useUploadWithProgress()

    const promise = upload('/upload', new File(['x'], 'a.txt'), { onError })
    await nextXhr()
    abort()
    const result = await promise

    expect(result).toEqual({ data: null, error: null, aborted: true })
    expect(status.value).toBe('aborted')
    expect(onError).not.toHaveBeenCalled()
    expect(hookNames()).not.toContain('movk:api:error')
  })

  it('timeout：返回 timeout ApiError 并上报', async () => {
    vi.useFakeTimers({ toFake: ['setTimeout', 'clearTimeout'] })
    const { upload, status } = useUploadWithProgress()

    const promise = upload('/upload', new File(['x'], 'a.txt'), { timeout: 1000 })
    await vi.advanceTimersByTimeAsync(1000)
    const result = await promise

    expect(result.error?.data?.kind).toBe('timeout')
    expect(status.value).toBe('error')
    expect(hookNames()).toContain('movk:api:error')
  })

  it('多文件用同一 fieldName 追加，fields 一并提交', async () => {
    const { upload } = useUploadWithProgress()
    const files = [new File(['a'], 'a.txt'), new File(['b'], 'b.txt')]

    const promise = upload('/upload', files, { fieldName: 'files', fields: { folder: 'docs' } })
    const xhr = await nextXhr()
    xhr.respond({ code: 0 })
    await promise

    const body = xhr.body as FormData
    expect(body.getAll('files')).toHaveLength(2)
    expect(body.get('folder')).toBe('docs')
  })

  it('注入端点 publicHeaders 与用户 headers，withCredentials 映射为携带凭证', async () => {
    const { upload } = useUploadWithProgress()

    const promise = upload('/upload', new File(['x'], 'a.txt'), {
      endpoint: 'tenant' as never,
      headers: { 'X-Trace': 'abc' },
      withCredentials: true
    })
    const xhr = await nextXhr()
    xhr.respond({ code: 0 })
    await promise

    expect(xhr.url).toBe('/tenant/upload')
    expect(xhr.requestHeaders['x-tenant']).toBe('t1')
    expect(xhr.requestHeaders['x-trace']).toBe('abc')
    expect(xhr.withCredentials).toBe(true)
  })

  it('businessCheck=false 时仍按 dataKey 解包', async () => {
    const { upload } = useUploadWithProgress()

    const promise = upload('/upload', new File(['x'], 'a.txt'), { businessCheck: false })
    ;(await nextXhr()).respond({ data: { url: '/f/1' } })
    const result = await promise

    expect(result.data).toEqual({ url: '/f/1' })
  })
})
