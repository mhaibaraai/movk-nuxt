import type { MovkZodOptions } from '../runtime/types/zod-config'
import type { ResolvedZodOptions } from '../runtime/domains/zod/apply'
import { resolveZodLocale } from '../runtime/domains/zod/locale-map'

export interface ResolvedZodSetup {
  options: ResolvedZodOptions
  /** 需要从 `zod/locales` 具名导入的语言 */
  imports: string[]
  /** 无法映射到 zod 语言的 locale code */
  unresolved: string[]
}

function resolveRequiredInputs(required: MovkZodOptions['required']): ResolvedZodOptions['requiredInputs'] {
  if (required === false) return false
  if (typeof required === 'object') return required.inputs ?? [undefined]
  return [undefined]
}

/** 归一化 `zod` 模块选项，并算出需要打包的 zod 语言 */
export function resolveZodOptions(zod: MovkZodOptions, available: readonly string[]): ResolvedZodSetup {
  const fallback = zod.fallback ?? 'en'
  const localeMap = zod.localeMap ?? {}
  const codes = zod.locale === 'auto'
    ? [...(zod.locales ?? []), fallback]
    : [zod.locale, fallback]

  const resolved = codes.map(code => ({ code, name: resolveZodLocale(code, available, localeMap) }))

  return {
    options: {
      locale: zod.locale,
      fallback,
      localeMap,
      requiredInputs: resolveRequiredInputs(zod.required),
      label: zod.label ?? true,
      jitless: zod.jitless ?? false
    },
    imports: [...new Set(resolved.map(item => item.name).filter((name): name is string => !!name))],
    unresolved: resolved.filter(item => !item.name).map(item => item.code)
  }
}

function serializeOptions(options: ResolvedZodOptions): string {
  const { requiredInputs, ...rest } = options
  const inputs = requiredInputs === false
    ? 'false'
    : `[${requiredInputs.map(value => value === undefined ? 'undefined' : JSON.stringify(value)).join(', ')}]`
  return JSON.stringify(rest, null, 2).replace(/\n\}$/, `,\n  "requiredInputs": ${inputs}\n}`)
}

/** `#build/movk-zod` 模板内容：只具名导入用到的 zod 语言，避免打包全部语言 */
export function generateZodTemplate(setup: Pick<ResolvedZodSetup, 'options' | 'imports'> | undefined): string {
  if (!setup) {
    return 'export const zodLocales = {}\nexport const zodOptions = undefined\n'
  }

  const names = setup.imports.join(', ')
  return [
    `import { ${names} } from 'zod/locales'`,
    '',
    `export const zodLocales = { ${names} }`,
    `export const zodOptions = ${serializeOptions(setup.options)}`,
    ''
  ].join('\n')
}
