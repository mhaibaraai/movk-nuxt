import { describe, expect, it } from 'vitest'
import { z } from 'zod'
import { cleanSearchPayload, parseSearchQuery, serializeSearchQuery } from '../../../src/runtime/domains/auto-form/search-query'

const schema = z.object({
  keyword: z.string().optional(),
  page: z.number().optional(),
  active: z.boolean().optional(),
  tags: z.array(z.string()).optional(),
  range: z.object({ from: z.string(), to: z.string() }).optional()
})

describe('cleanSearchPayload', () => {
  it('去除首尾空白、空字符串、undefined 与 null', () => {
    expect(cleanSearchPayload({ keyword: '  a ', empty: '', blank: '  ', none: undefined, nil: null, n: 0, b: false }))
      .toEqual({ keyword: 'a', n: 0, b: false })
  })

  it('不修改入参', () => {
    const data = { keyword: ' a ' }
    cleanSearchPayload(data)
    expect(data.keyword).toBe(' a ')
  })
})

describe('serializeSearchQuery', () => {
  it('标量转字符串、数组保留为多值、对象转 JSON，跳过空值', () => {
    expect(serializeSearchQuery({ keyword: 'a', page: 2, active: false, tags: ['x', 'y'], range: { from: '1', to: '2' }, empty: undefined }))
      .toEqual({ keyword: 'a', page: '2', active: 'false', tags: ['x', 'y'], range: '{"from":"1","to":"2"}' })
  })
})

describe('parseSearchQuery', () => {
  it('按 schema 类型还原', () => {
    expect(parseSearchQuery({ keyword: 'a', page: '2', active: 'true', tags: 'x', range: '{"from":"1","to":"2"}' }, schema))
      .toEqual({ keyword: 'a', page: 2, active: true, tags: ['x'], range: { from: '1', to: '2' } })
  })

  it('忽略 schema 外的键与无法解析的值', () => {
    expect(parseSearchQuery({ other: '1', page: 'abc', range: '{bad' }, schema)).toEqual({})
  })
})
