import { describe, expect, it, vi } from 'vitest'
import type { ApiAuthConfig } from '../../../src/runtime/types/api'

const sessionState = vi.hoisted(() => ({
  useUserSession: (() => ({ session: { value: { token: 'SESSION-TOKEN' } } })) as (() => unknown) | undefined
}))

vi.mock('#build/movk-session', () => ({
  get useUserSession() {
    return sessionState.useUserSession
  }
}))

// 模拟 SSR 中 await 之后丢失 Nuxt 上下文：一旦回退到全局 composable 即抛错
const contextLost = vi.hoisted(() => () => {
  throw new Error('[nuxt] instance unavailable')
})

vi.mock('#imports', () => ({
  useNuxtApp: contextLost,
  useRuntimeConfig: contextLost
}))

const { getAuthHeaders } = await import('../../../src/runtime/domains/api/auth')

const nuxtApp = {
  runWithContext: (fn: () => unknown) => fn(),
  $config: {
    public: {
      llmApiKey: 'PUBLIC-KEY',
      nested: { key: 'NESTED-KEY' }
    }
  }
} as unknown as Parameters<typeof getAuthHeaders>[1]

const baseAuth: ApiAuthConfig = {
  enabled: true,
  tokenType: 'Bearer',
  headerName: 'Authorization'
}

describe('domains/api/auth', () => {
  it('未启用认证时返回空对象', () => {
    expect(getAuthHeaders({ ...baseAuth, enabled: false }, nuxtApp)).toEqual({})
  })

  it('默认从 session 取 token', () => {
    expect(getAuthHeaders(baseAuth, nuxtApp)).toEqual({ Authorization: 'Bearer SESSION-TOKEN' })
  })

  it('未安装 nuxt-auth-utils 时 session 模式不注入请求头', () => {
    const original = sessionState.useUserSession
    sessionState.useUserSession = undefined
    try {
      expect(getAuthHeaders(baseAuth, nuxtApp)).toEqual({})
    }
    finally {
      sessionState.useUserSession = original
    }
  })

  it('tokenSource 为 public-runtime-config 时从 runtimeConfig.public 取 token', () => {
    const headers = getAuthHeaders({
      ...baseAuth,
      tokenSource: 'public-runtime-config',
      tokenPath: 'llmApiKey'
    }, nuxtApp)

    expect(headers).toEqual({ Authorization: 'Bearer PUBLIC-KEY' })
  })

  it('tokenPath 支持点号嵌套路径', () => {
    const headers = getAuthHeaders({
      ...baseAuth,
      tokenSource: 'public-runtime-config',
      tokenPath: 'nested.key'
    }, nuxtApp)

    expect(headers).toEqual({ Authorization: 'Bearer NESTED-KEY' })
  })

  it('tokenPath 取不到值时不注入请求头', () => {
    const headers = getAuthHeaders({
      ...baseAuth,
      tokenSource: 'public-runtime-config',
      tokenPath: 'missing.key'
    }, nuxtApp)

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
    }, nuxtApp)

    expect(headers).toEqual({ 'X-Auth': 'ApiKey PUBLIC-KEY' })
  })
})
