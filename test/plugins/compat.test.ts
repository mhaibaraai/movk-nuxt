import { afterEach, describe, expect, it, vi } from 'vitest'
import MovkCompatPlugin, { hasUnlayeredReset } from '../../src/plugins/compat'

const WIND4_RESET = '*, ::after, ::before, ::backdrop, ::file-selector-button { box-sizing: border-box; margin: 0; padding: 0; }\nbutton, input, select, optgroup, textarea, ::file-selector-button { background-color: transparent; }'

/** 构造带 unocss:api 插件的 Vite resolved config */
function unoConfig(css: string, outputToCssLayers?: unknown) {
  const ctx = {
    ready: Promise.resolve(),
    uno: {
      config: { outputToCssLayers },
      generate: vi.fn(async () => ({ css }))
    }
  }
  return { plugins: [{ name: 'unocss:api', api: { getContext: () => ctx } }] }
}

async function runConfigResolved(config: unknown) {
  const plugin = MovkCompatPlugin()
  await (plugin.vite as any).configResolved(config)
}

describe('hasUnlayeredReset', () => {
  it('识别 presetWind4 的 reset preflight', () => {
    expect(hasUnlayeredReset(WIND4_RESET)).toBe(true)
  })

  it('识别 presetWind3 / presetUno 的 reset preflight', () => {
    expect(hasUnlayeredReset('*,::before,::after{box-sizing:border-box;border-width:0;}')).toBe(true)
  })

  it('仅有主题变量或工具类时不命中', () => {
    expect(hasUnlayeredReset(':root, :host { --colors-primary: #409eff; }\n.mt-4 { margin-top: 1rem; }')).toBe(false)
  })

  it('已包裹在 @layer 中的 reset 不命中', () => {
    expect(hasUnlayeredReset(`@layer base {\n${WIND4_RESET}\n}`)).toBe(false)
  })
})

describe('MovkCompatPlugin 的 UnoCSS 检测', () => {
  afterEach(() => {
    vi.restoreAllMocks()
  })

  it('仅在 dev 下生效', () => {
    expect((MovkCompatPlugin().vite as any).apply).toBe('serve')
  })

  it('未使用 UnoCSS 时不警告', async () => {
    const warn = vi.spyOn(console, 'warn').mockImplementation(() => {})
    await runConfigResolved({ plugins: [{ name: 'vite:css' }] })
    expect(warn).not.toHaveBeenCalled()
  })

  it('outputToCssLayers 开启时跳过检测', async () => {
    const warn = vi.spyOn(console, 'warn').mockImplementation(() => {})
    const config = unoConfig(WIND4_RESET, true)
    await runConfigResolved(config)
    expect(warn).not.toHaveBeenCalled()
  })

  it('UnoCSS 输出非 layer reset 时警告一次', async () => {
    const warn = vi.spyOn(console, 'warn').mockImplementation(() => {})
    await runConfigResolved(unoConfig(WIND4_RESET))
    expect(warn).toHaveBeenCalledTimes(1)
    expect(warn.mock.calls[0]![0]).toContain('preflights: { reset: false }')
  })

  it('已关闭 reset 时不警告', async () => {
    const warn = vi.spyOn(console, 'warn').mockImplementation(() => {})
    await runConfigResolved(unoConfig(':root { --colors-primary: #409eff; }'))
    expect(warn).not.toHaveBeenCalled()
  })

  it('检测失败时静默跳过', async () => {
    const warn = vi.spyOn(console, 'warn').mockImplementation(() => {})
    const config = { plugins: [{ name: 'unocss:api', api: { getContext: () => { throw new Error('boom') } } }] }
    await expect(runConfigResolved(config)).resolves.toBeUndefined()
    expect(warn).not.toHaveBeenCalled()
  })
})
