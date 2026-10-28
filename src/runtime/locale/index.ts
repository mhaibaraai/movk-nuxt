import type { MovkMessages } from '../types/locale'
import en from './en'
import zh_cn from './zh_cn'

export { en, zh_cn }

/** 按 Nuxt UI locale code 索引的内置字典 */
export const movkLocales: Record<string, MovkMessages> = {
  'en': en,
  'zh-CN': zh_cn
}
