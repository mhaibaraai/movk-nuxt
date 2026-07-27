import { describe, expect, it, vi } from 'vitest'
import type { MovkApiPublicConfig } from '../../../src/runtime/types/api'
import { resolveEndpointConfig } from '../../../src/runtime/domains/api/endpoint-config'

const publicConfig: MovkApiPublicConfig = {
  defaultEndpoint: 'default',
  endpoints: {
    default: { baseURL: '/api' },
    external: {
      baseURL: 'https://api.example.com',
      publicHeaders: { 'X-Api-Version': '2', 'X-Tenant': 'public' }
    }
  },
  auth: { enabled: false },
  toast: { enabled: true },
  response: { dataKey: 'data' }
}

describe('domains/api/endpoint-config', () => {
  it('无私有配置时 publicHeaders 仍然生效（客户端场景）', () => {
    const resolved = resolveEndpointConfig(publicConfig, 'external')

    expect(resolved.headers).toEqual({ 'X-Api-Version': '2', 'X-Tenant': 'public' })
  })

  it('私有 headers 与 publicHeaders 合并，同名键私有优先', () => {
    const resolved = resolveEndpointConfig(publicConfig, 'external', {
      external: { headers: { 'Authorization': 'Bearer SECRET', 'X-Tenant': 'private' } }
    })

    expect(resolved.headers).toEqual({
      'Authorization': 'Bearer SECRET',
      'X-Api-Version': '2',
      'X-Tenant': 'private'
    })
  })

  it('两者都未配置时 headers 为 undefined', () => {
    const resolved = resolveEndpointConfig(publicConfig, 'default')

    expect(resolved.headers).toBeUndefined()
  })

  it('端点不存在时回退到默认端点并告警', () => {
    const warn = vi.spyOn(console, 'warn').mockImplementation(() => {})
    const resolved = resolveEndpointConfig(publicConfig, 'missing')

    expect(resolved.baseURL).toBe('/api')
    expect(warn).toHaveBeenCalled()
    warn.mockRestore()
  })
})
