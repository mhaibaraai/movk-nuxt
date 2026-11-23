import type { z } from 'zod'
import type { MovkTranslator } from '../../composables/useMovkLocale'
import type { ZodRequiredInput } from '../../types/zod-config'
import { getAutoFormMetadata } from '../auto-form/metadata'

type ZodErrorMap = z.core.$ZodErrorMap
type ZodRawIssue = Parameters<ZodErrorMap>[0]

export interface ErrorMapOptions {
  requiredInputs: ZodRequiredInput[] | false
  label: boolean
  getT: () => MovkTranslator
  customError?: ZodErrorMap
}

function resolveLabel(issue: ZodRawIssue): string | undefined {
  const schema = issue.schema ?? issue.inst
  if (!schema || !('_zod' in schema) || !('meta' in schema)) return
  const meta = getAutoFormMetadata(schema as z.ZodType)
  const label = meta.label ?? meta.title
  return typeof label === 'string' && label ? label : undefined
}

/** 组合用户 `customError` 与必填文案；返回 `undefined` 时交给 zod 的 locale 文案 */
export function createErrorMap(options: ErrorMapOptions): ZodErrorMap {
  const { requiredInputs, label, getT, customError } = options

  return (issue) => {
    const custom = customError?.(issue)
    if (custom != null) return custom

    if (!requiredInputs || !requiredInputs.includes(issue.input as ZodRequiredInput)) return

    const t = getT()
    const name = label ? resolveLabel(issue) : undefined
    return name ? t('validation.requiredWithLabel', { label: name }) : t('validation.required')
  }
}
