/** 不能由「去连字符 / 取主语言」规则推出的 locale code 映射 */
const BUILTIN_ZOD_LOCALE_MAP: Record<string, string> = {
  'zh': 'zhCN',
  'zh-Hans': 'zhCN',
  'zh-SG': 'zhCN',
  'zh-Hant': 'zhTW',
  'zh-HK': 'zhTW',
  'nb': 'no'
}

/**
 * 把 Nuxt UI locale code（如 `zh-CN`、`en-US`）解析为 `zod/locales` 的导出名，
 * 依次尝试 `localeMap`、内置映射、去连字符、主语言子标签。
 */
export function resolveZodLocale(
  code: string,
  available: readonly string[],
  localeMap: Record<string, string> = {}
): string | undefined {
  const candidates = [
    localeMap[code],
    BUILTIN_ZOD_LOCALE_MAP[code],
    code.replace(/-/g, ''),
    code.split('-')[0]
  ]
  return candidates.find((name): name is string => !!name && available.includes(name))
}
