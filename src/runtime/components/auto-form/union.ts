import type { ZodType } from 'zod/v4'

export interface UnionResolutionContext {
  discriminant?: string
  currentValue?: any
}

export function resolveDiscriminatedUnionSchema(schema: ZodType, ctx: UnionResolutionContext): ZodType | undefined {
  const def = (schema as any)?.def
  const discriminator: string | undefined = def?.discriminator ?? ctx.discriminant
  const optionsMap: Map<any, ZodType> | undefined = def?.optionsMap
  if (!discriminator || !optionsMap)
    return undefined

  const value = ctx.currentValue
  const key = value?.[discriminator]
  if (key == null)
    return undefined

  return optionsMap.get(key)
}


