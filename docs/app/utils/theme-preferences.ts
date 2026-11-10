/** 将旧 Layer 专用色板归还给样式表，避免覆盖 movk 的运行时主题 */
export function migrateDocsThemePreferences(
  name: string,
  storage: Pick<Storage, 'getItem' | 'setItem' | 'removeItem'>,
  style: Pick<CSSStyleDeclaration, 'removeProperty'>
): void {
  const aliases: string[] = (['primary', 'neutral'] as const).filter((alias) => {
    const key = `${name}-ui-${alias}`
    const previous = alias === 'primary' ? 'vermilion' : 'paper'
    if (storage.getItem(key) !== previous) return false
    storage.removeItem(key)
    for (const shade of [50, 100, 200, 300, 400, 500, 600, 700, 800, 900, 950]) {
      style.removeProperty(`--ui-color-${alias}-${shade}`)
    }
    return true
  })
  if (!aliases.length) return

  const key = `${name}-ui-colors`
  let cached: unknown
  try {
    cached = JSON.parse(storage.getItem(key) || 'null')
  } catch {
    cached = null
  }
  const remaining = Object.fromEntries(Object.entries(cached && typeof cached === 'object' ? cached : {}).filter(([variable, value]) => {
    const alias = /^--ui-color-(primary|neutral)-\d{2,3}$/.exec(variable)?.[1]
    return alias && typeof value === 'string' && !aliases.includes(alias)
  }))
  if (Object.keys(remaining).length) storage.setItem(key, JSON.stringify(remaining))
  else storage.removeItem(key)
}
