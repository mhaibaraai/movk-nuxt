export default () => ({
  slots: {
    root: 'inline-flex items-center gap-1',
    stars: 'flex items-center gap-0.5',
    star: 'transition-all duration-150'
  },
  variants: {
    interactive: {
      true: { star: 'cursor-pointer hover:scale-110' }
    },
    disabled: {
      true: { star: 'cursor-not-allowed opacity-50' }
    },
    readonly: {
      true: { star: 'cursor-default' }
    },
    fieldGroup: {
      horizontal: {
        root: 'rounded-md bg-default ring ring-inset ring-accented px-1 not-only:first:rounded-e-none not-only:last:rounded-s-none not-last:not-first:rounded-none focus-visible:z-[1]'
      },
      vertical: {
        root: 'rounded-md bg-default ring ring-inset ring-accented px-1 not-only:first:rounded-b-none not-only:last:rounded-t-none not-last:not-first:rounded-none focus-visible:z-[1]'
      }
    }
  }
})
