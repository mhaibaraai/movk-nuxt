import { describe, expect, it } from 'vitest'
import { extractData, extractMessage, isBusinessSuccess } from '../../../src/runtime/domains/api/response'

describe('domains/api/response', () => {
  describe('isBusinessSuccess', () => {
    it('默认 successCodes 包含 200 与 0', () => {
      expect(isBusinessSuccess({ code: 200 })).toBe(true)
      expect(isBusinessSuccess({ code: 0 })).toBe(true)
      expect(isBusinessSuccess({ code: 400 })).toBe(false)
    })

    it('自定义 codeKey 与 successCodes 生效', () => {
      const config = { codeKey: 'status', successCodes: ['OK', 1] }
      expect(isBusinessSuccess({ status: 'OK' }, config)).toBe(true)
      expect(isBusinessSuccess({ status: 1 }, config)).toBe(true)
      expect(isBusinessSuccess({ status: 'FAIL' }, config)).toBe(false)
    })

    it('字段缺失时判负', () => {
      expect(isBusinessSuccess({})).toBe(false)
    })
  })

  describe('extractMessage', () => {
    it('按 messageKey 取值，缺失时回退 message、msg', () => {
      expect(extractMessage({ message: 'hi' })).toBe('hi')
      expect(extractMessage({ msg: 'hello' })).toBe('hello')
      expect(extractMessage({ detail: 'd' }, { messageKey: 'detail' })).toBe('d')
      expect(extractMessage({})).toBeUndefined()
    })
  })

  describe('extractData', () => {
    it('命中 dataKey 时返回字段值', () => {
      expect(extractData({ code: 200, data: [1, 2, 3] })).toEqual([1, 2, 3])
    })

    it('null 值正确透传（不再回退整个响应）', () => {
      expect(extractData({ code: 200, data: null })).toBeNull()
    })

    it('字段不存在时返回 undefined（不再回退整个响应）', () => {
      const response = { code: 200, payload: 'x' }
      expect(extractData(response)).toBeUndefined()
    })

    it('自定义 dataKey 生效', () => {
      const response = { code: 200, payload: { id: 1 } }
      expect(extractData(response, { dataKey: 'payload' })).toEqual({ id: 1 })
    })
  })
})
