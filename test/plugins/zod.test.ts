import { beforeEach, describe, expect, it, vi } from 'vitest'
import { createApp } from 'vue'
import { z } from 'zod'
import { en } from 'zod/locales'

const build = vi.hoisted(() => ({ zodOptions: undefined as unknown, zodLocales: {} }))

vi.mock('#imports', () => ({ defineNuxtPlugin: (plugin: unknown) => plugin }))
vi.mock('#build/movk-zod', () => build)

type Hook = (...args: unknown[]) => unknown

function createNuxtApp() {
  const hooks = new Map<string, Hook[]>()
  return {
    vueApp: createApp({}),
    hook: (name: string, fn: Hook) => hooks.set(name, [...(hooks.get(name) ?? []), fn]),
    callHook: async (name: string, ...args: unknown[]) => {
      for (const fn of hooks.get(name) ?? []) await fn(...args)
    }
  }
}

async function runPlugin(nuxtApp: ReturnType<typeof createNuxtApp>) {
  const { default: plugin } = await import('../../src/runtime/plugins/zod') as unknown as { default: { setup: (app: unknown) => void } }
  plugin.setup(nuxtApp)
}

describe('zod 插件', () => {
  beforeEach(() => {
    z.config({ customError: undefined, localeError: en().localeError, jitless: false })
  })

  it('模板未开启时不调用 installZod', async () => {
    build.zodOptions = undefined
    await runPlugin(createNuxtApp())
    expect(z.config().customError).toBeUndefined()
  })

  it('开启时立即安装，并在 app:created 后收集 movk:zod:config 扩展', async () => {
    build.zodOptions = { locale: 'en', fallback: 'en', localeMap: {}, requiredInputs: false, label: false, jitless: false }
    const nuxtApp = createNuxtApp()
    const customError = () => 'custom'
    nuxtApp.hook('movk:zod:config', (config) => {
      (config as { customError?: unknown }).customError = customError
    })

    await runPlugin(nuxtApp)
    expect(z.config().customError).toBeTypeOf('function')
    const { useZodFormSchema } = await import('../../src/runtime/domains/zod/sync')
    const schema = z.object({ name: z.string() })

    await nuxtApp.callHook('app:created')
    const form = nuxtApp.vueApp.runWithContext(() => useZodFormSchema(() => schema).value!)
    expect((await form['~standard'].validate({})).issues?.[0]?.message).toBe('custom')
  })

  it('保留各 Nuxt 应用自己的映射，交错校验时彼此隔离', async () => {
    const first = createNuxtApp()
    const second = createNuxtApp()
    build.zodOptions = { locale: 'en', fallback: 'en', localeMap: {}, requiredInputs: false, label: false, jitless: false }
    first.hook('movk:zod:config', config => Object.assign(config as object, { customError: () => 'first' }))
    second.hook('movk:zod:config', config => Object.assign(config as object, { customError: () => 'second' }))

    await runPlugin(first)
    await runPlugin(second)
    await Promise.all([first.callHook('app:created'), second.callHook('app:created')])
    const { useZodFormSchema } = await import('../../src/runtime/domains/zod/sync')
    const schema = z.object({ name: z.string().transform(async name => name.toUpperCase()) })
    const firstSchema = first.vueApp.runWithContext(() => useZodFormSchema(() => schema).value!)
    const secondSchema = second.vueApp.runWithContext(() => useZodFormSchema(() => schema).value!)
    const [a, b] = await Promise.all([
      firstSchema['~standard'].validate({}),
      secondSchema['~standard'].validate({})
    ])
    expect(a.issues?.[0]?.message).toBe('first')
    expect(b.issues?.[0]?.message).toBe('second')
    await expect(firstSchema['~standard'].validate({ name: 'name' })).resolves.toEqual({ value: { name: 'NAME' } })
    expect(schema.safeParse({}).error?.issues[0]?.message).not.toMatch(/first|second/)
  })
})
