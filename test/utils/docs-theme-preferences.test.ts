import { describe, expect, it } from 'vitest'
import { migrateDocsThemePreferences } from '../../docs/app/utils/theme-preferences'

function createPreferences(initial: Record<string, string>) {
  const values = new Map(Object.entries(initial))
  const styles = new Map([
    ['--ui-color-primary-500', 'var(--color-vermilion-500)'],
    ['--ui-color-neutral-500', 'var(--color-paper-500)'],
    ['--ui-radius', '0.5rem']
  ])
  const storage = {
    getItem: (key: string) => values.get(key) ?? null,
    setItem: (key: string, value: string) => { values.set(key, value) },
    removeItem: (key: string) => { values.delete(key) }
  }
  return { values, styles, storage, style: { removeProperty: (key: string) => styles.delete(key) ? key : '' } }
}

describe('文档站旧主题偏好迁移', () => {
  it('将 Layer 自定义色板交还 CSS，同时清除首屏恢复的变量与缓存', () => {
    const prefs = createPreferences({
      'docs-ui-primary': 'vermilion',
      'docs-ui-neutral': 'paper',
      'docs-ui-radius': '0.5',
      'docs-ui-colors': JSON.stringify({ '--ui-color-primary-500': 'red', '--ui-color-neutral-500': 'gray' })
    })
    migrateDocsThemePreferences('docs', prefs.storage, prefs.style)
    expect(Object.fromEntries(prefs.values)).toEqual({ 'docs-ui-radius': '0.5' })
    expect(Object.fromEntries(prefs.styles)).toEqual({ '--ui-radius': '0.5rem' })
  })

  it('保留有效 Tailwind 偏好及另一色板的缓存和内联值', () => {
    const prefs = createPreferences({
      'docs-ui-primary': 'blue',
      'docs-ui-neutral': 'paper',
      'docs-ui-icons': 'tabler',
      'docs-ui-colors': JSON.stringify({ '--ui-color-primary-500': 'blue', '--ui-color-neutral-500': 'gray' })
    })
    migrateDocsThemePreferences('docs', prefs.storage, prefs.style)
    expect(prefs.values.get('docs-ui-primary')).toBe('blue')
    expect(prefs.values.get('docs-ui-icons')).toBe('tabler')
    expect(JSON.parse(prefs.values.get('docs-ui-colors')!)).toEqual({ '--ui-color-primary-500': 'blue' })
    expect(prefs.styles.has('--ui-color-primary-500')).toBe(true)
    expect(prefs.styles.has('--ui-color-neutral-500')).toBe(false)
  })

  it('损坏的旧缓存不阻止迁移，其他站点的偏好保持不变', () => {
    const prefs = createPreferences({ 'docs-ui-primary': 'vermilion', 'docs-ui-colors': '{', 'other-ui-primary': 'vermilion' })
    migrateDocsThemePreferences('docs', prefs.storage, prefs.style)
    expect(Object.fromEntries(prefs.values)).toEqual({ 'other-ui-primary': 'vermilion' })
  })
})
