const _variant = [
  'solid',
  'outline',
  'soft',
  'subtle',
  'ghost',
  'naked',
] as const

const _highlightColor = [
  'primary',
  'secondary',
  'success',
  'info',
  'warning',
  'error',
  'neutral',
] as const

export default {
  slots: {
    root: 'flex relative',
    container: 'relative flex flex-col flex-1 lg:grid gap-x-8 gap-y-4',
    wrapper: 'flex flex-col flex-1 items-start',
    header: 'mb-4',
    body: 'flex-1',
    footer: 'pt-4 mt-auto',
    leading: 'inline-flex items-center mb-2.5',
    leadingIcon: 'size-5 shrink-0 text-primary',
    title: 'text-base text-pretty font-semibold text-highlighted',
    description: 'text-[15px] text-pretty',
  },
  variants: {
    orientation: {
      horizontal: {
        container: 'lg:grid-cols-2 lg:items-center',
      },
      vertical: {
        container: '',
      },
    },
    reverse: {
      true: {
        wrapper: 'lg:order-last',
      },
    },
    variant: {
      solid: {
        root: 'bg-inverted text-inverted',
        title: 'text-inverted',
        description: 'text-dimmed',
      },
      outline: {
        root: 'bg-default ring ring-default',
        description: 'text-muted',
      },
      soft: {
        root: 'bg-elevated/50',
        description: 'text-toned',
      },
      subtle: {
        root: 'bg-elevated/50 ring ring-default',
        description: 'text-toned',
      },
      ghost: {
        description: 'text-muted',
      },
      naked: {
        container: 'p-0 sm:p-0',
        description: 'text-muted',
      },
    },
    to: {
      true: {
        root: [
          'transition',
        ],
      },
    },
    title: {
      true: {
        description: 'mt-1',
      },
    },
    highlight: {
      true: {
        root: 'ring-2',
      },
    },
    highlightColor: {
      primary: '',
      secondary: '',
      success: '',
      info: '',
      warning: '',
      error: '',
      neutral: '',
    },
  },
  compoundVariants: [
    {
      variant: 'solid' as typeof _variant[number],
      to: true,
      class: {
        root: 'hover:bg-inverted/90',
      },
    },
    {
      variant: 'outline' as typeof _variant[number],
      to: true,
      class: {
        root: 'hover:bg-elevated/50',
      },
    },
    {
      variant: 'soft' as typeof _variant[number],
      to: true,
      class: {
        root: 'hover:bg-elevated',
      },
    },
    {
      variant: 'subtle' as typeof _variant[number],
      to: true,
      class: {
        root: 'hover:bg-elevated',
      },
    },
    {
      variant: 'subtle' as typeof _variant[number],
      to: true,
      highlight: false,
      class: {
        root: 'hover:ring-accented',
      },
    },
    {
      variant: 'ghost' as typeof _variant[number],
      to: true,
      class: {
        root: 'hover:bg-elevated/50',
      },
    },
    {
      highlightColor: 'primary' as typeof _highlightColor[number],
      highlight: true,
      class: {
        root: 'ring-primary',
      },
    },
    {
      highlightColor: 'secondary' as typeof _highlightColor[number],
      highlight: true,
      class: {
        root: 'ring-secondary',
      },
    },
    {
      highlightColor: 'success' as typeof _highlightColor[number],
      highlight: true,
      class: {
        root: 'ring-success',
      },
    },
    {
      highlightColor: 'info' as typeof _highlightColor[number],
      highlight: true,
      class: {
        root: 'ring-info',
      },
    },
    {
      highlightColor: 'warning' as typeof _highlightColor[number],
      highlight: true,
      class: {
        root: 'ring-warning',
      },
    },
    {
      highlightColor: 'error' as typeof _highlightColor[number],
      highlight: true,
      class: {
        root: 'ring-error',
      },
    },
    {
      highlightColor: 'neutral' as typeof _highlightColor[number],
      highlight: true,
      class: {
        root: 'ring-inverted',
      },
    },
  ],
  defaultVariants: {
    variant: 'outline' as typeof _variant[number],
    highlightColor: 'primary' as typeof _highlightColor[number],
  },
}
