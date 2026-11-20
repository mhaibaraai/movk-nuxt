import { computed, inject } from 'vue'
import type { InjectionKey } from 'vue'
import type { z } from 'zod'
import type { MovkZodRuntimeConfig } from '../../types/zod-config'
import { useMovkLocale } from '../../composables/useMovkLocale'
import { dictionaryTranslator, resolveLocaleError } from './apply'
import type { ResolvedZodOptions, ZodLocaleFactory } from './apply'
import { createErrorMap } from './error-map'

interface ZodFormContext {
  options: ResolvedZodOptions
  locales: Record<string, ZodLocaleFactory>
  runtime: MovkZodRuntimeConfig
}

export const ZOD_FORM_CONTEXT: InjectionKey<ZodFormContext> = Symbol('movk-zod-form')

export function useZodFormSchema<S extends z.ZodType>(getSchema: () => S | undefined) {
  const context = inject(ZOD_FORM_CONTEXT, undefined)
  const locale = context?.options.locale === 'auto' && !import.meta.server ? useMovkLocale() : undefined

  return computed(() => {
    const schema = getSchema()
    if (!schema || !context) return schema
    const { options, locales, runtime } = context
    const code = locale?.code.value ?? (options.locale === 'auto' ? options.fallback : options.locale)
    const errorMap = createErrorMap({
      requiredInputs: options.requiredInputs,
      label: options.label,
      getT: () => locale?.t ?? dictionaryTranslator(code),
      customError: runtime.customError
    })
    const localeError = resolveLocaleError(code, options, locales)

    const standard: z.core.$ZodStandardSchema<S> = {
      ...schema['~standard'],
      async validate(input) {
        const result = await schema.safeParseAsync(input, { error: issue => errorMap(issue) ?? localeError?.(issue) })
        return result.success ? { value: result.data } : { issues: result.error.issues }
      }
    }
    // Scope Standard Schema validation to this form without changing the caller's schema.
    return Object.defineProperty(schema.clone(), '~standard', { value: standard })
  })
}
