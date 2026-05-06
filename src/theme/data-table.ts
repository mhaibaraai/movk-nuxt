const ROW_SEP = '[[data-slot=tr]+[data-slot=tr]>&]'
const PINNED = 'data-[pinned]'
const PINNED_L = 'data-[pinned=left]'
const NOT_LAST_NOT_PIN = 'not-last:not-data-[pinned=left]:not-data-[pinned=right]'
const GROUP_HEADER = '[[data-slot=tr]:has([colspan])>&]'

const BW = 'var(--m-dt-border-width,1px)'
const BC = 'var(--m-dt-border-color,var(--ui-border))'
const BS = 'var(--m-dt-border-style,solid)'

export default () => ({
  slots: {
    root: '',
    base: 'border-separate border-spacing-0',
    tbody: 'divide-y-0',
    th: [
      `${PINNED}:sticky`,
      `${PINNED}:[--m-dt-pin-shadow:0_0_0_0_transparent]`,
      `${PINNED}:shadow-[var(--m-dt-pin-shadow)]`
    ].join(' '),
    td: [
      'empty:p-0',
      `${ROW_SEP}:border-t`,
      `${ROW_SEP}:border-default`,
      `${PINNED}:sticky`,
      `${PINNED}:[--m-dt-pin-shadow:0_0_0_0_transparent]`,
      `${PINNED}:shadow-[var(--m-dt-pin-shadow)]`,
      '[[data-selected=true]>&[data-pinned]]:bg-[color:color-mix(in_oklab,var(--ui-bg-elevated)_50%,transparent)]'
    ].join(' ')
  },
  variants: {
    fitContent: {
      true: {
        base: 'w-fit min-w-0'
      }
    },
    bordered: {
      true: {
        base: [
          `border-[length:${BW}]`,
          `border-[color:${BC}]`,
          `[border-style:${BS}]`,
          'rounded-[var(--ui-radius)]',
          'overflow-hidden'
        ].join(' '),
        th: [
          `${NOT_LAST_NOT_PIN}:border-r-[length:${BW}]`,
          `${NOT_LAST_NOT_PIN}:border-r-[color:${BC}]`,
          `${NOT_LAST_NOT_PIN}:[border-right-style:${BS}]`,
          `${PINNED_L}:shadow-[inset_-1px_0_0_${BC},var(--m-dt-pin-shadow)]`,
          `${GROUP_HEADER}:border-b-[length:${BW}]`,
          `${GROUP_HEADER}:border-b-[color:${BC}]`,
          `${GROUP_HEADER}:[border-bottom-style:${BS}]`
        ].join(' '),
        td: [
          `${ROW_SEP}:border-t-[length:${BW}]`,
          `${ROW_SEP}:border-t-[color:${BC}]`,
          `${ROW_SEP}:[border-top-style:${BS}]`,
          `${NOT_LAST_NOT_PIN}:border-r-[length:${BW}]`,
          `${NOT_LAST_NOT_PIN}:border-r-[color:${BC}]`,
          `${NOT_LAST_NOT_PIN}:[border-right-style:${BS}]`,
          `${PINNED_L}:shadow-[inset_-1px_0_0_${BC},var(--m-dt-pin-shadow)]`
        ].join(' ')
      }
    },
    striped: {
      true: {
        td: '[[data-slot=tr]:nth-child(even)>&[data-pinned]]:bg-[color:color-mix(in_oklab,var(--ui-bg-accented)_10%,transparent)]'
      }
    },
    tree: {
      true: {
        tr: 'has-[>[data-slot=td]:only-child:empty]:hidden'
      }
    },
    resizing: {
      true: {
        base: 'cursor-col-resize! select-none! [&_*]:cursor-col-resize! [&_*]:select-none!'
      }
    }
  }
})
