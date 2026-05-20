import { describe, expect, it } from 'vitest'
import { createApiError } from '../../../src/runtime/domains/api/errors'

describe('domains/api/errors', () => {
  it('数字业务码作为 statusCode 保留；message 取自显式参数', () => {
    const err = createApiError({ code: 40001, message: 'bad' }, 'bad')
    expect(err.statusCode).toBe(40001)
    expect(err.message).toBe('bad')
    expect(err.isBusinessError).toBe(true)
  })

  it('字符串业务码不再产生 NaN，可解析数字时正常转换', () => {
    const numericString = createApiError({ code: '500' }, 'srv')
    expect(numericString.statusCode).toBe(500)
  })

  it('完全无法解析为数字的字符串码回退到 500', () => {
    const err = createApiError({ code: 'A0001' }, 'biz')
    expect(err.statusCode).toBe(500)
    expect(Number.isNaN(err.statusCode)).toBe(false)
  })

  it('code 缺失时回退到 status，再缺失回退 500', () => {
    expect(createApiError({ status: 404 }).statusCode).toBe(404)
    expect(createApiError({}).statusCode).toBe(500)
  })

  it('cause 指向原始响应；response 字段同样持有', () => {
    const response = { code: 1, message: 'm' }
    const err = createApiError(response)
    expect(err.response).toBe(response)
    expect((err as Error & { cause?: unknown }).cause).toBe(response)
  })

  it('默认 message 为「请求失败」', () => {
    expect(createApiError({}).message).toBe('请求失败')
  })
})
