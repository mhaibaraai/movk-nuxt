import { describe, expect, it } from 'vitest'
import { z } from 'zod/v4'
import { resolveDiscriminatedUnionSchema } from '../src/runtime/components/auto-form/union'

describe('resolveDiscriminatedUnionSchema', () => {
  it('resolves by discriminator and current value', () => {
    const A = z.object({ type: z.literal('a'), a: z.string() })
    const B = z.object({ type: z.literal('b'), b: z.number() })
    const U = z.discriminatedUnion('type', [A, B])

    // emulate internals present in zod v4 discriminated union
    const schema: any = U
    const chosen = resolveDiscriminatedUnionSchema(schema, { currentValue: { type: 'b' } })
    expect(chosen).toBeTruthy()
  })
})
