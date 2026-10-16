import type { Nuxt } from '@nuxt/schema'
import { describe, expect, it } from 'vitest'
import movkModule from '../src/module'

type ModuleDependencies = Record<string, { version?: string, defaults?: Record<string, unknown> }>

/** defineNuxtModule 把 moduleDependencies 归一化成模块上的 getModuleDependencies */
const getModuleDependencies = (movkModule as unknown as {
  getModuleDependencies: (nuxt: Nuxt) => ModuleDependencies | Promise<ModuleDependencies>
}).getModuleDependencies

function createNuxt(ui?: Record<string, unknown>, movk?: Record<string, unknown>) {
  return { options: { ui, movk } } as unknown as Nuxt & { options: { ui?: { fonts?: boolean } } }
}

describe('module 的 moduleDependencies', () => {
  it('未配置时把 ui.fonts 置为 false，阻止 @nuxt/ui 登记 @nuxt/fonts', async () => {
    const nuxt = createNuxt({})
    await getModuleDependencies(nuxt)

    expect(nuxt.options.ui?.fonts).toBe(false)
  })

  it('nuxt.options.ui 缺省时先初始化再置位', async () => {
    const nuxt = createNuxt()
    await getModuleDependencies(nuxt)

    expect(nuxt.options.ui).toEqual({ fonts: false })
  })

  it('消费方显式写的 ui.fonts 优先于模块默认', async () => {
    const nuxt = createNuxt({ fonts: true })
    await getModuleDependencies(nuxt)

    expect(nuxt.options.ui?.fonts).toBe(true)
  })

  it('依赖表只声明版本约束，不再用失效的 defaults 表达 fonts 意图', async () => {
    const deps = await getModuleDependencies(createNuxt({}))

    expect(deps['@nuxt/ui']).toEqual({ version: '>=4.6.0' })
    expect(Object.keys(deps)).toEqual([
      '@nuxt/image',
      '@nuxt/ui',
      '@vueuse/nuxt',
      'nuxt-site-config'
    ])
  })
})

describe('module 按需登记 nuxt-auth-utils', () => {
  const hasAuthUtils = async (movk?: Record<string, unknown>) =>
    'nuxt-auth-utils' in await getModuleDependencies(createNuxt({}, movk))

  it('默认未开启认证时不登记', async () => {
    expect(await hasAuthUtils()).toBe(false)
    expect(await hasAuthUtils({ api: {} })).toBe(false)
  })

  it('开启认证且 token 来自 session 时登记', async () => {
    expect(await hasAuthUtils({ api: { auth: { enabled: true } } })).toBe(true)
    expect(await hasAuthUtils({ api: { auth: { enabled: true, tokenSource: 'session' } } })).toBe(true)
  })

  it('token 来自 public-runtime-config 时不登记', async () => {
    expect(await hasAuthUtils({ api: { auth: { enabled: true, tokenSource: 'public-runtime-config' } } })).toBe(false)
  })

  it('关闭 API 模块时不登记', async () => {
    expect(await hasAuthUtils({ api: { enabled: false, auth: { enabled: true } } })).toBe(false)
  })

  it('登记时附带版本约束', async () => {
    const deps = await getModuleDependencies(createNuxt({}, { api: { auth: { enabled: true } } }))
    expect(deps['nuxt-auth-utils']).toEqual({ version: '>=0.5.29' })
  })
})
