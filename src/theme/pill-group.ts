import type { ModuleOptions } from '../module'

export default (options: Required<ModuleOptions>) => ({
  slots: {
    root: 'flex items-center gap-2',
    list: 'relative flex p-1 group',
    indicator: 'absolute transition-[translate,width] duration-200',
    trigger: ['group relative inline-flex items-center min-w-0 data-[state=inactive]:text-muted hover:data-[state=inactive]:not-disabled:text-default font-medium rounded-md disabled:cursor-not-allowed disabled:opacity-75', 'transition-colors'],
    leadingIcon: 'shrink-0',
    leadingAvatar: 'shrink-0',
    leadingAvatarSize: '',
    label: 'truncate',
    trailingBadge: 'shrink-0',
    trailingBadgeSize: 'sm'
    // item: 'transition-colors',
    // itemBody: 'inline-flex flex-col items-start min-w-0',
    // itemLabel: 'truncate',
    // itemDescription: 'text-xs text-muted truncate'
  },
  variants: {
    color: {
      ...Object.fromEntries((options.theme.colors || []).map((color: string) => [color, ''])),
      neutral: ''
    },
    orientation: {
      horizontal: { list: 'flex-row items-center' },
      vertical: { list: 'flex-col items-stretch' }
    },
    size: {
      xs: { list: 'gap-0.5 p-0.5' },
      sm: { list: 'gap-1 p-0.5' },
      md: { list: 'gap-1 p-1' },
      lg: { list: 'gap-1.5 p-1' },
      xl: { list: 'gap-2 p-1.5' }
    },
    disabled: {
      true: { root: 'opacity-60 pointer-events-none' }
    },
    fieldGroup: {
      horizontal: {
        root: 'rounded-md overflow-hidden not-only:first:rounded-e-none not-only:last:rounded-s-none not-last:not-first:rounded-none focus-within:z-[1]',
        list: 'rounded-md'
      },
      vertical: {
        root: 'rounded-md overflow-hidden not-only:first:rounded-b-none not-only:last:rounded-t-none not-last:not-first:rounded-none focus-within:z-[1]',
        list: 'rounded-md'
      }
    },
    variant: {
      solid: { list: 'bg-elevated/50 ring-1 ring-default' },
      outline: { list: 'ring-1 ring-default' },
      soft: { list: 'bg-elevated/50' },
      subtle: { list: 'bg-elevated/25 ring-1 ring-default' },
      ghost: { list: 'p-0' },
      link: { list: 'p-0' }
    }
  },
  defaultVariants: {
    orientation: 'horizontal',
    size: 'md',
    variant: 'solid'
  }
})
