import { describe, expect, it } from 'vitest'
import { z } from 'zod/v4'
import { introspectSchema } from '../src/runtime/components/auto-form/introspect'

describe('introspectSchema', () => {
  it('walks object and array', () => {
    const schema = z.object({
      user: z.object({ name: z.string(), age: z.number() }),
      tags: z.array(z.string()),
    })
    const fields = introspectSchema(schema)
    const paths = fields.map(f => f.path)
    expect(paths).toContain('user.name')
    expect(paths).toContain('user.age')
    expect(paths).toContain('tags[0]')
  })
})
