import { useNuxtApp } from '#imports'
import zhCnLocales from '../i18n/locales/zh_cn.json'

function getNestedValue(obj: any, path: string): string | undefined {
  return path.split('.').reduce((current, key) => {
    return current && typeof current === 'object' ? current[key] : undefined
  }, obj)
}

/**
 * 智能翻译：优先使用用户定义的翻译，回退到模块默认翻译
 *
 * @param key 翻译键
 * @returns 翻译文本
 */
export function smartT(key: string): string {
  let i18n: any
  const { $i18n } = useNuxtApp()
  if ($i18n) {
    i18n = $i18n
    try {
      const translated = i18n.t(key)
      if (translated && translated !== key) {
        return translated
      }
    }
    catch {
    }
  }
  return getNestedValue(zhCnLocales, key) || key
}
