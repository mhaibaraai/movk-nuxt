import type { Nuxt } from '@nuxt/schema'
import { mkdtempSync, writeFileSync } from 'node:fs'
import { tmpdir } from 'node:os'
import { join } from 'node:path'
import { beforeEach, describe, expect, it, vi } from 'vitest'

const warn = vi.fn()

vi.mock('@nuxt/kit', async importOriginal => ({
  ...await importOriginal<typeof import('@nuxt/kit')>(),
  useLogger: () => ({ warn })
}))

const { checkMovkCss } = await import('../../src/utils/css')

const dir = mkdtempSync(join(tmpdir(), 'movk-css-'))
const withImport = join(dir, 'main.css')
const withoutImport = join(dir, 'bare.css')

writeFileSync(withImport, '@import "tailwindcss";\n@import "@movk/nuxt";\n')
writeFileSync(withoutImport, '@import "tailwindcss";\n')

/** css 传绝对路径：测试里没有 Nuxt 上下文，resolveAlias 拿不到 alias 表，只能原样返回 */
function createNuxt(css: string[], prepare = false) {
  return { options: { css, _prepare: prepare } } as unknown as Nuxt
}

describe('checkMovkCss', () => {
  beforeEach(() => warn.mockClear())

  it('引入了模块样式时不告警', async () => {
    await checkMovkCss(createNuxt([withImport]))

    expect(warn).not.toHaveBeenCalled()
  })

  it('裸包名直接作为 css 入口时不告警', async () => {
    await checkMovkCss(createNuxt(['@movk/nuxt']))

    expect(warn).not.toHaveBeenCalled()
  })

  it('读不出的入口不中断判定，交由其余入口裁决', async () => {
    await checkMovkCss(createNuxt(['~/not/a/real/file.css', withImport]))

    expect(warn).not.toHaveBeenCalled()
  })

  it('所有入口都没引入模块样式时告警', async () => {
    await checkMovkCss(createNuxt([withoutImport]))

    expect(warn).toHaveBeenCalledOnce()
  })

  it('prepare 实例不参与判定：module-builder 的合成实例没有任何 css', async () => {
    await checkMovkCss(createNuxt([], true))
    await checkMovkCss(createNuxt([withoutImport], true))

    expect(warn).not.toHaveBeenCalled()
  })
})
