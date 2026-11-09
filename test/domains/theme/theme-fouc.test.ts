import { afterEach, describe, expect, it, vi } from 'vitest'

import { createColorRestoreScript, restorePaletteVars } from '../../../src/runtime/domains/theme/theme-fouc'

function runScript(script: string, stored: Record<string, string>) {
  const props = new Map<string, string>()
  const localStorage = { getItem: (key: string) => stored[key] ?? null }
  const document = { documentElement: { style: { setProperty: (k: string, v: string) => props.set(k, v) } } }
  new Function('localStorage', 'document', script)(localStorage, document)
  return props
}

describe('createColorRestoreScript', () => {
  it('首屏前把存储的色板变量写到 <html>', () => {
    const vars = { '--ui-color-primary-500': 'oklch(1 0 0)', '--ui-color-neutral-50': 'oklch(0 0 0)' }
    const props = runScript(createColorRestoreScript('app'), { 'app-ui-colors': JSON.stringify(vars) })
    expect(Object.fromEntries(props)).toEqual(vars)
  })

  it('只接受 primary/neutral 色阶变量', () => {
    const vars = { '--ui-color-primary-500': 'red', '--ui-radius': '1rem', '--ui-color-error-500': 'red' }
    const props = runScript(createColorRestoreScript('app'), { 'app-ui-colors': JSON.stringify(vars) })
    expect([...props.keys()]).toEqual(['--ui-color-primary-500'])
  })

  it('存储缺失或损坏时静默跳过', () => {
    expect(runScript(createColorRestoreScript('app'), {}).size).toBe(0)
    expect(runScript(createColorRestoreScript('app'), { 'app-ui-colors': '{bad' }).size).toBe(0)
  })
})

describe('restorePaletteVars', () => {
  afterEach(() => {
    vi.unstubAllGlobals()
  })

  function stub(stored: Record<string, string>) {
    const props = new Map<string, string>()
    const removed: string[] = []
    vi.stubGlobal('localStorage', {
      getItem: (key: string) => stored[key] ?? null,
      removeItem: (key: string) => removed.push(key)
    })
    vi.stubGlobal('document', {
      documentElement: { style: { setProperty: (k: string, v: string) => props.set(k, v), removeProperty: () => {} } }
    })
    return { props, removed }
  }

  it('与首屏脚本按同一规则过滤后回放', () => {
    const vars = { '--ui-color-neutral-900': 'oklch(0 0 0)', '--ui-radius': '1rem' }
    const { props } = stub({ 'app-ui-colors': JSON.stringify(vars) })
    restorePaletteVars('app')
    expect(Object.fromEntries(props)).toEqual({ '--ui-color-neutral-900': 'oklch(0 0 0)' })
  })

  it('存储损坏时清除该键', () => {
    const { props, removed } = stub({ 'app-ui-colors': '{bad' })
    restorePaletteVars('app')
    expect(props.size).toBe(0)
    expect(removed).toEqual(['app-ui-colors'])
  })
})
