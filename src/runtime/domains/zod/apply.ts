import { z } from 'zod'
import type { ZodRequiredInput } from '../../types/zod-config'
import type { MovkTranslator } from '../../locale'
import { createTranslator, en, movkLocales } from '../../locale'
import { createErrorMap } from './error-map'
import { resolveZodLocale } from './locale-map'

type ZodErrorMap = z.core.$ZodErrorMap
export type ZodLocaleFactory = () => { localeError: ZodErrorMap }

/** 构建期归一化后的 `zod` 模块选项，经 `#build/movk-zod` 注入运行时 */
export interface ResolvedZodOptions {
  locale: string
  fallback: string
  localeMap: Record<string, string>
  requiredInputs: ZodRequiredInput[] | false
  label: boolean
  jitless: boolean
}

export function resolveLocaleError(
  code: string,
  options: ResolvedZodOptions,
  locales: Record<string, ZodLocaleFactory>
): ZodErrorMap | undefined {
  const names = Object.keys(locales)
  const name = resolveZodLocale(code, names, options.localeMap)
    ?? resolveZodLocale(options.fallback, names, options.localeMap)
  return name ? locales[name]?.().localeError : undefined
}

export function dictionaryTranslator(code: string): MovkTranslator {
  const messages = movkLocales[code] ?? en
  return createTranslator(() => messages)
}

/**
 * 全局配置只包含构建期设置。每个应用的错误映射与界面语言由单次表单校验提供。
 */
export function installZod(
  options: ResolvedZodOptions,
  locales: Record<string, ZodLocaleFactory>
): void {
  const initial = options.locale === 'auto' ? options.fallback : options.locale
  const t = dictionaryTranslator(initial)
  z.config({
    jitless: options.jitless,
    localeError: resolveLocaleError(initial, options, locales),
    customError: createErrorMap({
      requiredInputs: options.requiredInputs,
      label: options.label,
      getT: () => t
    })
  })
}
