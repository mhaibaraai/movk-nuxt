import { describe, expect, it } from 'vitest'

import { createColorSwapScript } from '../../../src/runtime/domains/theme/theme-fouc'

function colorsCss(prefix = '') {
  const p = prefix ? `${prefix}-` : ''
  return [
    `--ui-color-primary-500: var(--${p}color-blue-500, #3b82f6);`,
    `--ui-color-neutral-500: var(--${p}color-old-neutral-500, #737373);`
  ].join('\n')
}

function runScript(script: string, stored: Record<string, string>, css: string) {
  const el = { innerHTML: css }
  const localStorage = { getItem: (key: string) => stored[key] ?? null }
  const document = { querySelector: () => el, head: {} }
  new Function('localStorage', 'document', script)(localStorage, document)
  return el.innerHTML
}

describe('createColorSwapScript', () => {
  it('按 localStorage 替换主色与中性色的色板引用', () => {
    const script = createColorSwapScript('app')
    const html = runScript(script, { 'app-ui-primary': 'green', 'app-ui-neutral': 'zinc' }, colorsCss())
    expect(html).toContain('--ui-color-primary-500: var(--color-green-500, #3b82f6)')
    expect(html).toContain('--ui-color-neutral-500: var(--color-zinc-500, #737373)')
  })

  it('配置 theme.prefix 时匹配带前缀的 Tailwind 变量', () => {
    const script = createColorSwapScript('app', 'tw')
    const html = runScript(script, { 'app-ui-primary': 'green' }, colorsCss('tw'))
    expect(html).toContain('var(--tw-color-green-500, #3b82f6)')
  })

  it('选择 neutral 色板时映射为 old-neutral', () => {
    const script = createColorSwapScript('app')
    const html = runScript(script, { 'app-ui-primary': 'neutral', 'app-ui-neutral': 'neutral' }, colorsCss())
    expect(html).toContain('var(--color-old-neutral-500, #3b82f6)')
    expect(html).toContain('var(--color-old-neutral-500, #737373)')
  })

  it('黑色主色与非法色名不改写色板', () => {
    const script = createColorSwapScript('app')
    const css = colorsCss()
    expect(runScript(script, { 'app-ui-primary': 'black' }, css)).toBe(css)
    expect(runScript(script, { 'app-ui-primary': 'red);}body{' }, css)).toBe(css)
  })

  it('未存储任何颜色时不触碰 DOM', () => {
    const script = createColorSwapScript('app')
    expect(runScript(script, {}, colorsCss())).toBe(colorsCss())
  })
})
