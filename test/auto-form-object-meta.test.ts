import { describe, expect, it } from 'vitest'
import { createAutoFormZ, getAutoFormMetadata } from '../src/runtime/shared/auto-form'

describe('afz.object meta 支持', () => {
  const { afz } = createAutoFormZ()

  it('应该支持在 object 创建时直接传入 meta', () => {
    const schema = afz.object({
      name: afz.string(),
    }, { label: '用户信息' })

    const meta = getAutoFormMetadata(schema)
    expect(meta).toEqual({ label: '用户信息' })
  })

  it('应该支持链式调用 .meta()', () => {
    const schema = afz.object({
      name: afz.string(),
    }).meta({ label: '用户信息' })

    const meta = getAutoFormMetadata(schema)
    expect(meta).toEqual({ label: '用户信息' })
  })

  it('应该支持柯里化写法传入 meta', () => {
    interface State {
      name: string
    }

    const schema = afz.object<State>()({
      name: afz.string(),
    }, { label: '用户信息' })

    const meta = getAutoFormMetadata(schema)
    expect(meta).toEqual({ label: '用户信息' })
  })

  it('应该支持柯里化写法链式调用 .meta()', () => {
    interface State {
      name: string
    }

    const schema = afz.object<State>()({
      name: afz.string(),
    }).meta({ label: '用户信息' })

    const meta = getAutoFormMetadata(schema)
    expect(meta).toEqual({ label: '用户信息' })
  })

  it('应该支持链式调用后继续获取 meta', () => {
    const schema = afz.object({
      name: afz.string(),
    })
      .meta({ label: '用户信息' })
      .default({ name: '' })

    const meta = getAutoFormMetadata(schema)
    expect(meta).toEqual({ label: '用户信息' })
  })

  it('应该支持嵌套 object 的 meta', () => {
    const schema = afz.object({
      user: afz.object({
        name: afz.string(),
      }).meta({ label: '用户' }),
    }).meta({ label: '表单' })

    const meta = getAutoFormMetadata(schema)
    expect(meta).toEqual({ label: '表单' })

    // 验证嵌套对象的 meta
    const userSchema = schema.shape.user
    const userMeta = getAutoFormMetadata(userSchema)
    expect(userMeta).toEqual({ label: '用户' })
  })

  it('应该支持多次调用 .meta() 合并元数据', () => {
    const schema = afz.object({
      name: afz.string(),
    })
      .meta({ label: '用户信息' })
      .meta({ description: '请填写用户信息' })

    const meta = getAutoFormMetadata(schema)
    expect(meta).toEqual({
      label: '用户信息',
      description: '请填写用户信息',
    })
  })
})
