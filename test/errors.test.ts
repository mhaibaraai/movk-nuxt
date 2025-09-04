import { describe, expect, it } from 'vitest'
import { z } from 'zod/v4'
import { aggregateZodErrors } from '../src/runtime/components/auto-form/utils'

describe('aggregateZodErrors', () => {
  it('aggregates field and form errors', () => {
    const schema = z.object({
      a: z.string(),
      b: z.number(),
    }).superRefine((val, ctx) => {
      if (val.a === 'x' && val.b === 1)
        ctx.addIssue({ code: z.ZodIssueCode.custom, message: 'bad combo' })
    })
    const res = schema.safeParse({ a: 'x', b: 1 })
    if (res.success)
      throw new Error('should fail')
    const agg = aggregateZodErrors(res.error)
    expect(Array.isArray(agg.fieldErrors)).toBe(true)
    expect(Array.isArray(agg.formErrors)).toBe(true)
  })
})
