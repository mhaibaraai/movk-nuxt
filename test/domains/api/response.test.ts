import { describe, expect, it } from 'vitest'
import {
  extractCode,
  extractData,
  extractMessage,
  interpretResponse,
  isBusinessSuccess,
  resolvePolicy
} from '../../../src/runtime/domains/api/response'

const NON_OBJECTS: unknown[] = [null, undefined, 'text', 42, true, [1, 2]]

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

  describe('非对象响应守卫', () => {
    it.each(NON_OBJECTS)('%o 不抛错：判负、无消息、无数据、无业务码', (raw) => {
      expect(isBusinessSuccess(raw)).toBe(false)
      expect(extractMessage(raw)).toBeUndefined()
      expect(extractData(raw)).toBeUndefined()
      expect(extractCode(raw)).toBeUndefined()
    })
  })

  describe('resolvePolicy', () => {
    it('全部缺省时校验与解包均开启', () => {
      expect(resolvePolicy({})).toEqual({ check: true, unwrap: true })
    })

    it('端点 / 全局配置关闭时生效', () => {
      expect(resolvePolicy({ businessCheck: false, unwrap: false })).toEqual({ check: false, unwrap: false })
    })

    it('请求显式值优先：可重新开启端点关闭的能力', () => {
      expect(resolvePolicy({ businessCheck: false, unwrap: false }, { businessCheck: true, unwrap: true }))
        .toEqual({ check: true, unwrap: true })
    })

    it('请求显式 false 覆盖端点开启', () => {
      expect(resolvePolicy({ businessCheck: true }, { businessCheck: false })).toEqual({ check: false, unwrap: true })
    })

    it('请求未传时继承端点配置', () => {
      expect(resolvePolicy({ unwrap: false }, { toast: false })).toEqual({ check: true, unwrap: false })
    })
  })

  describe('interpretResponse', () => {
    const config = { successCodes: [0], codeKey: 'code', messageKey: 'message', dataKey: 'data' }

    it('校验通过并解包', () => {
      expect(interpretResponse({ code: 0, data: { id: 1 } }, { check: true, unwrap: true }, config))
        .toEqual({ ok: true, data: { id: 1 } })
    })

    it('校验失败返回业务码与消息', () => {
      expect(interpretResponse({ code: 40001, message: 'bad' }, { check: true, unwrap: true }, config))
        .toEqual({ ok: false, code: 40001, message: 'bad' })
    })

    it('裸数组在校验与解包均关闭时原样返回', () => {
      const raw = [{ id: 1 }]
      expect(interpretResponse(raw, { check: false, unwrap: false }, config)).toEqual({ ok: true, data: raw })
    })

    it('开启校验时非对象响应判为失败而非抛错', () => {
      expect(interpretResponse(null, { check: true, unwrap: true }, config)).toEqual({ ok: false, code: undefined, message: undefined })
    })

    it('关闭校验仍解包：取 dataKey 字段', () => {
      expect(interpretResponse({ data: 'x' }, { check: false, unwrap: true }, config)).toEqual({ ok: true, data: 'x' })
    })
  })
})
