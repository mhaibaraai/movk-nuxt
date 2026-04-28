export default () => ({
  slots: {
    base: 'peer',
    trailing: 'pe-1',
    label: [
      'pointer-events-none absolute -top-2.5 px-1.5 transition-all',
      'text-highlighted text-xs font-medium',
      'peer-focus:-top-2.5 peer-focus:text-highlighted peer-focus:text-xs peer-focus:font-medium',
      'peer-placeholder-shown:text-dimmed peer-placeholder-shown:font-normal',
      'peer-placeholder-shown:top-1/2 peer-placeholder-shown:-translate-y-1/2 peer-focus:translate-y-0'
    ].join(' '),
    labelText: 'inline-flex bg-default px-1'
  },
  variants: {
    size: {
      xs: { label: 'peer-placeholder-shown:text-xs' },
      sm: { label: 'peer-placeholder-shown:text-xs' },
      md: { label: 'peer-placeholder-shown:text-sm' },
      lg: { label: 'peer-placeholder-shown:text-sm' },
      xl: { label: 'peer-placeholder-shown:text-base' }
    },
    hasLeading: {
      true: {},
      false: { label: 'left-0' }
    }
  },
  compoundVariants: [
    { size: 'xs', hasLeading: true, class: { label: 'left-5' } },
    { size: 'sm', hasLeading: true, class: { label: 'left-6' } },
    { size: 'md', hasLeading: true, class: { label: 'left-7' } },
    { size: 'lg', hasLeading: true, class: { label: 'left-8' } },
    { size: 'xl', hasLeading: true, class: { label: 'left-9' } }
  ],
  defaultVariants: {
    size: 'md',
    hasLeading: false
  }
})
