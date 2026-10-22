import { beforeEach, describe, expect, it, vi } from 'vitest'
import { MockXHR } from '../../../helpers/mock-xhr'
import { parseXhrHeaders, xhrFetch } from '../../../../src/runtime/domains/api/adapters/xhr'

describe('domains/api/adapters/xhr', () => {
  beforeEach(() => {
    MockXHR.instances = []
    vi.stubGlobal('XMLHttpRequest', MockXHR as unknown as typeof XMLHttpRequest)
  })

  it('parseXhrHeaders 解析多行 header 字符串', () => {
    const headers = parseXhrHeaders('Content-Type: application/json\r\nX-Trace: a:b\r\n')
    expect(headers.get('content-type')).toBe('application/json')
    expect(headers.get('x-trace')).toBe('a:b')
  })

  it('按 init 发出请求并把响应包装为标准 Response', async () => {
    const promise = xhrFetch('/upload', {
      method: 'POST',
      body: 'payload',
      credentials: 'include',
      headers: { 'X-Tenant': 't1' }
    })
    const xhr = MockXHR.instances[0]!
    expect(xhr.method).toBe('POST')
    expect(xhr.url).toBe('/upload')
    expect(xhr.body).toBe('payload')
    expect(xhr.withCredentials).toBe(true)
    expect(xhr.requestHeaders['x-tenant']).toBe('t1')

    xhr.respond({ code: 0 }, 201)
    const response = await promise

    expect(response.status).toBe(201)
    expect(response.headers.get('content-type')).toBe('application/json')
    expect(await response.json()).toEqual({ code: 0 })
  })

  it('204 响应体为空', async () => {
    const promise = xhrFetch('/x')
    const xhr = MockXHR.instances[0]!
    xhr.status = 204
    xhr.response = new Blob(['ignored'])
    xhr.dispatch('load')

    expect((await promise).body).toBeNull()
  })

  it('转发上传进度', async () => {
    const onUploadProgress = vi.fn()
    const promise = xhrFetch('/x', { method: 'POST', onUploadProgress } as RequestInit)
    const xhr = MockXHR.instances[0]!

    xhr.triggerUploadProgress(30, 100)
    xhr.respond({})
    await promise

    expect(onUploadProgress).toHaveBeenCalledWith(expect.objectContaining({ loaded: 30, total: 100 }))
  })

  it('网络失败按 fetch 语义抛 TypeError', async () => {
    const promise = xhrFetch('/x')
    MockXHR.instances[0]!.dispatch('error')

    await expect(promise).rejects.toBeInstanceOf(TypeError)
  })

  it('signal 中止时 abort XHR 并以 signal.reason 拒绝', async () => {
    const controller = new AbortController()
    const promise = xhrFetch('/x', { signal: controller.signal })
    const reason = Object.assign(new Error('timeout'), { name: 'TimeoutError' })

    controller.abort(reason)

    await expect(promise).rejects.toBe(reason)
  })

  it('signal 已中止时不发请求', async () => {
    const controller = new AbortController()
    controller.abort()

    await expect(xhrFetch('/x', { signal: controller.signal })).rejects.toMatchObject({ name: 'AbortError' })
    expect(MockXHR.instances).toHaveLength(0)
  })
})
