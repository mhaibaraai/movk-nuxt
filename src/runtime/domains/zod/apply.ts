import { z } from 'zod'
import type { MovkZodRuntimeConfig, ZodRequiredInput } from '../../types/zod-config'
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

interface ZodState {
  options: ResolvedZodOptions
  locales: Record<string, ZodLocaleFactory>
  localeError?: ZodErrorMap
  t: MovkTranslator
  customError?: ZodErrorMap
}

let state: ZodState | undefined

function resolveLocaleError(
  code: string,
  options: ResolvedZodOptions,
  locales: Record<string, ZodLocaleFactory>
): ZodErrorMap | undefined {
  const names = Object.keys(locales)
  const name = resolveZodLocale(code, names, options.localeMap)
    ?? resolveZodLocale(options.fallback, names, options.localeMap)
  return name ? locales[name]?.().localeError : undefined
}

function dictionaryTranslator(code: string): MovkTranslator {
  const messages = movkLocales[code] ?? en
  return createTranslator(() => messages)
}

/**
 * 写入全局 `z.config`。错误映射在校验时才读取当前状态，
 * 因此后续切换语言或追加 `customError` 无需再次调用 `z.config`。
 */
export function installZod(
  options: ResolvedZodOptions,
  locales: Record<string, ZodLocaleFactory>,
  runtime: MovkZodRuntimeConfig = {}
): void {
  const initial = options.locale === 'auto' ? options.fallback : options.locale
  state = {
    options,
    locales,
    localeError: resolveLocaleError(initial, options, locales),
    t: dictionaryTranslator(initial),
    customError: runtime.customError
  }

  z.config({
    jitless: options.jitless,
    localeError: issue => state?.localeError?.(issue),
    customError: createErrorMap({
      requiredInputs: options.requiredInputs,
      label: options.label,
      getT: () => state?.t ?? dictionaryTranslator(initial),
      customError: issue => state?.customError?.(issue)
    })
  })
}

export function extendZodConfig(runtime: MovkZodRuntimeConfig): void {
  if (!state || !runtime.customError) return
  state = { ...state, customError: runtime.customError }
}

export function isZodLocaleAuto(): boolean {
  return state?.options.locale === 'auto'
}

/** `auto` 模式下切换 zod 文案语言与必填文案的 translator；其余模式忽略 */
export function syncZodLocale(code: string, t: MovkTranslator): void {
  if (!state || state.options.locale !== 'auto') return
  state = { ...state, localeError: resolveLocaleError(code, state.options, state.locales), t }
}
