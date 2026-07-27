import { describe, expect, it } from 'vitest'
import { getDefaultApiConfig } from '../../src/utils/defaults'

describe('utils/defaults', () => {
  const { publicConfig, privateConfig } = getDefaultApiConfig({
    endpoints: {
      external: {
        baseURL: 'https://api.example.com',
        headers: { Authorization: 'Bearer SECRET' },
        publicHeaders: { 'X-Api-Version': '2' }
      }
    }
  })

  it('机密 headers 只进私有配置', () => {
    expect(privateConfig.endpoints?.external?.headers).toEqual({ Authorization: 'Bearer SECRET' })
    expect(publicConfig.endpoints.external).not.toHaveProperty('headers')
  })

  it('publicHeaders 保留在公共配置中', () => {
    expect(publicConfig.endpoints.external.publicHeaders).toEqual({ 'X-Api-Version': '2' })
    expect(privateConfig.endpoints?.external).not.toHaveProperty('publicHeaders')
  })

  it('未配置端点时保留内置 default 端点', () => {
    const { publicConfig: fallback } = getDefaultApiConfig({})

    expect(fallback.endpoints.default).toEqual({ baseURL: '/api' })
    expect(fallback.auth.tokenSource).toBe('session')
  })
})
