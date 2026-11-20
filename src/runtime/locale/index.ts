import type { MovkMessageKey, MovkMessages } from '../types/locale'
import { interpolate } from '../utils/interpolate'
import en from './en'
import zh_cn from './zh_cn'

export { en, zh_cn }

export type MovkTranslator = (key: MovkMessageKey, vars?: Record<string, string | number>) => string

/** 按 Nuxt UI locale code 索引的内置字典 */
export const movkLocales: Record<string, MovkMessages> = {
  'en': en,
  'zh-CN': zh_cn
}

export function createTranslator(getMessages: () => MovkMessages): MovkTranslator {
  return (key, vars) => {
    const [group, name] = key.split('.') as [keyof MovkMessages, string]
    const message = (getMessages()[group] as Record<string, unknown> | undefined)?.[name]
    return typeof message === 'string' ? interpolate(message, vars) : key
  }
}
