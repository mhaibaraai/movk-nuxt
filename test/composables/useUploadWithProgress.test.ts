import { beforeEach, describe, expect, it, vi } from 'vitest'
import type { MovkApiPublicConfig } from '../../src/runtime/types/api'

const toastAdd = vi.fn()
const callHook = vi.fn(async () => {})

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

const { useUploadWithProgress } = await import('../../src/runtime/composables/useUploadWithProgress')

class MockUpload {
  listeners: Array<(e: { lengthComputable: boolean, loaded: number, total: number }) => void> = []
  addEventListener(_type: string, l: (e: { lengthComputable: boolean, loaded: number, total: number }) => void) {
    this.listeners.push(l)
  }
}

class MockXHR {
  static instances: MockXHR[] = []
  upload = new MockUpload()
  status = 200
  statusText = 'OK'
  responseText = ''
  timeout = 0
  withCredentials = false
  requestHeaders: Record<string, string> = {}
  responseHeaders: Record<string, string> = { 'content-type': 'application/json' }
  private listeners: Record<string, Array<(e: Event) => void>> = {}

  constructor() {
    MockXHR.instances.push(this)
  }

  open(_method: string, _url: string) {}

  setRequestHeader(name: string, value: string) {
    this.requestHeaders[name] = value
  }

  send(_body: unknown) {}

  abort() {
    this.dispatch('abort')
  }

  addEventListener(type: string, listener: (e: Event) => void) {
    (this.listeners[type] ||= []).push(listener)
  }

  getAllResponseHeaders(): string {
    return Object.entries(this.responseHeaders).map(([k, v]) => `${k}: ${v}`).join('\r\n')
  }

  dispatch(type: string) {
    for (const l of this.listeners[type] || []) l(new Event(type))
  }

  triggerUploadProgress(loaded: number, total: number) {
    for (const l of this.upload.listeners) l({ lengthComputable: true, loaded, total })
  }
}

describe('useUploadWithProgress', () => {
  beforeEach(() => {
    toastAdd.mockClear()
    callHook.mockClear()
    MockXHR.instances = []
    vi.stubGlobal('XMLHttpRequest', MockXHR as unknown as typeof XMLHttpRequest)
  })

  it('上传成功：解包业务数据、status=success、派发 movk:api:response', async () => {
    const { upload, data, status } = useUploadWithProgress<{ id: number }>()
    const file = new File(['x'], 'a.txt')

    const promise = upload('/upload', file)
    const xhr = MockXHR.instances[0]!
    xhr.responseText = JSON.stringify({ code: 0, data: { id: 9 } })
    xhr.dispatch('load')
    const result = await promise

    expect(result.data).toEqual({ id: 9 })
    expect(result.error).toBeNull()
    expect(data.value).toEqual({ id: 9 })
    expect(status.value).toBe('success')
    expect(callHook).toHaveBeenCalledWith('movk:api:response', expect.anything())
  })

  it('进度事件更新 progress', async () => {
    const { upload, progress } = useUploadWithProgress()
    const file = new File(['x'], 'a.txt')

    const promise = upload('/upload', file)
    const xhr = MockXHR.instances[0]!
    xhr.triggerUploadProgress(50, 100)
    expect(progress.value).toBe(50)
    xhr.responseText = JSON.stringify({ code: 0, data: 1 })
    xhr.dispatch('load')
    await promise
    expect(progress.value).toBe(100)
  })

  it('业务失败：返回 ApiError、派发 movk:api:error', async () => {
    const { upload } = useUploadWithProgress()
    const file = new File(['x'], 'a.txt')

    const promise = upload('/upload', file)
    const xhr = MockXHR.instances[0]!
    xhr.responseText = JSON.stringify({ code: 40001, message: '文件类型不允许' })
    xhr.dispatch('load')
    const result = await promise

    expect(result.error).toMatchObject({ message: '文件类型不允许', isBusinessError: true })
    expect(callHook).toHaveBeenCalledWith('movk:api:error', expect.anything())
  })

  it('HTTP 错误：error 包含 status', async () => {
    const { upload } = useUploadWithProgress()
    const file = new File(['x'], 'a.txt')

    const promise = upload('/upload', file)
    const xhr = MockXHR.instances[0]!
    xhr.status = 500
    xhr.statusText = 'Internal Server Error'
    xhr.responseText = ''
    xhr.responseHeaders = { 'content-type': 'text/plain' }
    xhr.dispatch('load')
    const result = await promise

    expect(result.error).toBeTruthy()
    expect(result.error!.message).toContain('500')
  })

  it('网络错误：触发 onError', async () => {
    const onError = vi.fn()
    const { upload } = useUploadWithProgress()
    const file = new File(['x'], 'a.txt')

    const promise = upload('/upload', file, { onError })
    const xhr = MockXHR.instances[0]!
    xhr.dispatch('error')
    const result = await promise

    expect(result.error?.message).toContain('网络错误')
    expect(onError).toHaveBeenCalled()
  })

  it('abort：aborted=true、status=aborted、不触发 onError', async () => {
    const onError = vi.fn()
    const { upload, abort, status } = useUploadWithProgress()
    const file = new File(['x'], 'a.txt')

    const promise = upload('/upload', file, { onError })
    abort()
    const result = await promise

    expect(result.aborted).toBe(true)
    expect(result.error).toBeNull()
    expect(status.value).toBe('aborted')
    expect(onError).not.toHaveBeenCalled()
  })

  it('timeout：返回超时错误', async () => {
    const { upload } = useUploadWithProgress()
    const file = new File(['x'], 'a.txt')

    const promise = upload('/upload', file, { timeoutMs: 1000 })
    const xhr = MockXHR.instances[0]!
    expect(xhr.timeout).toBe(1000)
    xhr.dispatch('timeout')
    const result = await promise

    expect(result.error?.message).toContain('超时')
  })

  it('多文件用同一 fieldName 追加', async () => {
    const { upload } = useUploadWithProgress()
    const files = [new File(['a'], 'a.txt'), new File(['b'], 'b.txt')]

    const promise = upload('/upload', files, { fieldName: 'files' })
    const xhr = MockXHR.instances[0]!
    xhr.responseText = JSON.stringify({ code: 0, data: { count: 2 } })
    xhr.dispatch('load')
    const result = await promise

    expect(result.error).toBeNull()
  })

  it('用户 headers 覆盖 auth 同名 header', async () => {
    const { upload } = useUploadWithProgress()
    const file = new File(['x'], 'a.txt')

    const promise = upload('/upload', file, { headers: { Authorization: 'Bearer override' } })
    const xhr = MockXHR.instances[0]!
    xhr.responseText = JSON.stringify({ code: 0 })
    xhr.dispatch('load')
    await promise

    expect(xhr.requestHeaders.Authorization).toBe('Bearer override')
  })
})
