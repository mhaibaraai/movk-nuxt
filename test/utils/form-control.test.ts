import { describe, expect, it } from 'vitest'
import { omitProps } from '../../src/runtime/utils/form-control'

describe('form-control utils', () => {
  it('omits wrapper private props and keeps input field props', () => {
    const forwarded = omitProps({
      id: 'name-input',
      name: 'name',
      size: 'xs',
      disabled: true,
      highlight: true,
      placeholder: 'Name',
      buttonProps: { icon: 'i-lucide-x' },
      ui: { base: 'rounded-none' }
    }, ['buttonProps', 'ui'])

    expect(forwarded).toEqual({
      id: 'name-input',
      name: 'name',
      size: 'xs',
      disabled: true,
      highlight: true,
      placeholder: 'Name'
    })
  })
})
