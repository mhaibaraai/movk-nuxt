import { describe, expect, it, vi } from 'vitest'
import { FetchError } from 'ofetch'

vi.mock('#imports', async () => await import('../../helpers/nuxt-error'))

const { createApiError, getErrorContext, bindErrorContext, isApiError, toApiError } = await import('../../../src/runtime/domains/api/errors')

function fetchError(options: { status?: number, data?: unknown, cause?: { name: string } }) {
  const error = new FetchError('failed', options.cause ? { cause: options.cause } : undefined)
  if (options.status !== undefined) {
    Object.assign(error, { response: { status: options.status, _data: options.data }, data: options.data })
  }
  return error
}

describe('domains/api/errors', () => {
  describe('createApiError', () => {
    it('HTTP 语义范围内的业务码作为 statusCode，原值保留在 data.code', () => {
      const err = createApiError({ kind: 'business', endpoint: 'default', code: 401, message: 'no' })
      expect(err.statusCode).toBe(401)
      expect(err.data).toEqual({ kind: 'business', endpoint: 'default', code: 401, response: undefined })
      expect(err.message).toBe('no')
    })

    it('超出 HTTP 范围或无法解析的业务码 statusCode 回退 500', () => {
      expect(createApiError({ kind: 'business', endpoint: 'e', code: 40001 }).statusCode).toBe(500)
      expect(createApiError({ kind: 'business', endpoint: 'e', code: 'A0001' }).statusCode).toBe(500)
      expect(createApiError({ kind: 'business', endpoint: 'e', code: '404' }).statusCode).toBe(404)
    })

    it('message 缺省时按分类取默认文案', () => {
      expect(createApiError({ kind: 'network', endpoint: 'e' }).message).toBe('网络错误')
      expect(createApiError({ kind: 'timeout', endpoint: 'e' }).message).toBe('请求超时')
    })

    it('产物满足 isApiError（NuxtError + data.kind）', () => {
      expect(isApiError(createApiError({ kind: 'http', endpoint: 'e' }))).toBe(true)
      expect(isApiError(new Error('x'))).toBe(false)
    })
  })

  describe('toApiError', () => {
    it('已是 ApiError 时原样返回', () => {
      const err = createApiError({ kind: 'business', endpoint: 'e' })
      expect(toApiError(err, 'e')).toBe(err)
    })

    it('带响应的 FetchError 归为 http，message 取自响应体', () => {
      const err = toApiError(fetchError({ status: 422, data: { message: '参数错误' } }), 'v2')
      expect(err?.data).toMatchObject({ kind: 'http', endpoint: 'v2', code: 422, response: { message: '参数错误' } })
      expect(err?.statusCode).toBe(422)
      expect(err?.message).toBe('参数错误')
    })

    it('响应体无消息时回退「请求失败 (状态码)」', () => {
      expect(toApiError(fetchError({ status: 500, data: '<html>' }), 'e')?.message).toBe('请求失败 (500)')
    })

    it('无响应的 FetchError 归为 network', () => {
      expect(toApiError(fetchError({}), 'e')?.data?.kind).toBe('network')
    })

    it('cause 为 AbortError / TimeoutError 时分别归为 aborted / timeout', () => {
      expect(toApiError(fetchError({ cause: { name: 'AbortError' } }), 'e')?.data?.kind).toBe('aborted')
      expect(toApiError(fetchError({ cause: { name: 'TimeoutError' } }), 'e')?.data?.kind).toBe('timeout')
    })

    it('无法识别的错误返回 null', () => {
      expect(toApiError(new TypeError('boom'), 'e')).toBeNull()
    })
  })

  describe('错误上下文', () => {
    it('业务错误经 bindErrorContext 携带上下文', () => {
      const context = { request: '/x', options: {} }
      const err = bindErrorContext(createApiError({ kind: 'business', endpoint: 'e' }), context as never)
      expect(getErrorContext(err)).toBe(context)
    })

    it('FetchError 从自身字段还原上下文', () => {
      const err = fetchError({ status: 500 })
      Object.assign(err, { request: '/y', options: { method: 'GET' } })
      expect(getErrorContext(err)).toMatchObject({ request: '/y', options: { method: 'GET' }, error: err })
    })
  })
})
