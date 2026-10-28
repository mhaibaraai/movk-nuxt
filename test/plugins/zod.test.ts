import { beforeEach, describe, expect, it, vi } from 'vitest'

const installZod = vi.fn()
const extendZodConfig = vi.fn()
const build = vi.hoisted(() => ({ zodOptions: undefined as unknown, zodLocales: {} }))

vi.mock('#imports', () => ({ defineNuxtPlugin: (plugin: unknown) => plugin }))
vi.mock('#build/movk-zod', () => build)
vi.mock('../../src/runtime/domains/zod/apply', () => ({ installZod, extendZodConfig }))

type Hook = (...args: unknown[]) => unknown

function createNuxtApp() {
  const hooks = new Map<string, Hook[]>()
  return {
    hook: (name: string, fn: Hook) => hooks.set(name, [...(hooks.get(name) ?? []), fn]),
    callHook: async (name: string, ...args: unknown[]) => {
      for (const fn of hooks.get(name) ?? []) await fn(...args)
    }
  }
}

async function runPlugin(nuxtApp: ReturnType<typeof createNuxtApp>) {
  vi.resetModules()
  const { default: plugin } = await import('../../src/runtime/plugins/zod') as unknown as { default: { setup: (app: unknown) => void } }
  plugin.setup(nuxtApp)
}

describe('zod 插件', () => {
  beforeEach(() => {
    installZod.mockReset()
    extendZodConfig.mockReset()
  })

  it('模板未开启时不调用 installZod', async () => {
    build.zodOptions = undefined
    await runPlugin(createNuxtApp())
    expect(installZod).not.toHaveBeenCalled()
  })

  it('开启时立即安装，并在 app:created 后收集 movk:zod:config 扩展', async () => {
    build.zodOptions = { locale: 'auto' }
    const nuxtApp = createNuxtApp()
    const customError = () => 'custom'
    nuxtApp.hook('movk:zod:config', (config) => {
      (config as { customError?: unknown }).customError = customError
    })

    await runPlugin(nuxtApp)
    expect(installZod).toHaveBeenCalledWith(build.zodOptions, build.zodLocales)
    expect(extendZodConfig).not.toHaveBeenCalled()

    await nuxtApp.callHook('app:created')
    expect(extendZodConfig).toHaveBeenCalledWith({ customError })
  })
})
