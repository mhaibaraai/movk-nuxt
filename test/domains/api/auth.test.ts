import { describe, expect, it, vi } from 'vitest'
import type { ApiAuthConfig } from '../../../src/runtime/types/api'

vi.mock('#imports', () => ({
  useNuxtApp: () => ({ vueApp: { runWithContext: (fn: () => unknown) => fn() } }),
  useUserSession: () => ({ session: { value: { token: 'SESSION-TOKEN' } } }),
  useRuntimeConfig: () => ({
    public: {
      llmApiKey: 'PUBLIC-KEY',
      nested: { key: 'NESTED-KEY' }
    }
  })
}))

const { getAuthHeaders } = await import('../../../src/runtime/domains/api/auth')

const baseAuth: ApiAuthConfig = {
  enabled: true,
  tokenType: 'Bearer',
  headerName: 'Authorization'
}

describe('domains/api/auth', () => {
  it('未启用认证时返回空对象', () => {
    expect(getAuthHeaders({ ...baseAuth, enabled: false })).toEqual({})
  })

  it('默认从 session 取 token', () => {
    expect(getAuthHeaders(baseAuth)).toEqual({ Authorization: 'Bearer SESSION-TOKEN' })
  })

  it('tokenSource 为 public-runtime-config 时从 runtimeConfig.public 取 token', () => {
    const headers = getAuthHeaders({
      ...baseAuth,
      tokenSource: 'public-runtime-config',
      tokenPath: 'llmApiKey'
    })

    expect(headers).toEqual({ Authorization: 'Bearer PUBLIC-KEY' })
  })

  it('tokenPath 支持点号嵌套路径', () => {
    const headers = getAuthHeaders({
      ...baseAuth,
      tokenSource: 'public-runtime-config',
      tokenPath: 'nested.key'
    })

    expect(headers).toEqual({ Authorization: 'Bearer NESTED-KEY' })
  })

  it('tokenPath 取不到值时不注入请求头', () => {
    const headers = getAuthHeaders({
      ...baseAuth,
      tokenSource: 'public-runtime-config',
      tokenPath: 'missing.key'
    })

    expect(headers).toEqual({})
  })

  it('public-runtime-config 模式下 headerName 与 Custom tokenType 生效', () => {
    const headers = getAuthHeaders({
      enabled: true,
      tokenSource: 'public-runtime-config',
      tokenPath: 'llmApiKey',
      tokenType: 'Custom',
      customTokenType: 'ApiKey',
      headerName: 'X-Auth'
    })

    expect(headers).toEqual({ 'X-Auth': 'ApiKey PUBLIC-KEY' })
  })
})
