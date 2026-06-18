const ROW_SEP = '[[data-slot=tr]+[data-slot=tr]>&]'
const PINNED = 'data-[pinned]'
const PINNED_L = 'data-[pinned=left]'
const NOT_LAST_NOT_PIN = 'not-last:not-data-[pinned=left]:not-data-[pinned=right]'
const GROUP_HEADER = '[[data-slot=tr]:has([colspan])>&]'

// 真正固定的列(左/右),区别于非固定列的 data-pinned="false"
const PIN = '&:is([data-pinned=left],[data-pinned=right])'
// 非固定的普通列,保留半透明行底色以适配任意容器背景
const NOT_PIN = '&[data-pinned]:not([data-pinned=left]):not([data-pinned=right])'
// 行状态下固定列的不透明底色,与半透明版同色但混入 --ui-bg 防止横向滚动透出
const PIN_BG_SELECTED = `[[data-selected=true]>${PIN}]:bg-[color:color-mix(in_oklab,var(--ui-bg-elevated)_50%,var(--ui-bg))]`
const PIN_BG_HOVER = `[[data-slot=tr][data-selectable=true]:hover>${PIN}]:bg-[color:color-mix(in_oklab,var(--ui-bg-elevated)_50%,var(--ui-bg))]`
const NOT_PIN_BG_SELECTED = `[[data-selected=true]>${NOT_PIN}]:bg-[color:color-mix(in_oklab,var(--ui-bg-elevated)_50%,transparent)]`
// 固定列柔和分隔阴影色,可经 --m-dt-pin-shadow-color 覆盖
const PIN_SHADOW_COLOR = `[${PIN}]:[--m-dt-pin-shadow-color:color-mix(in_oklab,var(--ui-text-muted)_25%,transparent)]`
// 横向滚动到左侧下方时,最后一个左固定列浮出右向阴影
const PIN_L_EDGE = `[[data-pin-start]_&[data-pinned=left]:not(:has(+[data-pinned=left]))]:[--m-dt-pin-shadow:8px_0_10px_-8px_var(--m-dt-pin-shadow-color)]`
// 横向滚动到右侧下方时,第一个右固定列浮出左向阴影
const PIN_R_EDGE = `[[data-pin-end]_:not([data-pinned=right])+&[data-pinned=right]]:[--m-dt-pin-shadow:-8px_0_10px_-8px_var(--m-dt-pin-shadow-color)]`

const BW = 'var(--m-dt-border-width,1px)'
const BC = 'var(--m-dt-border-color,var(--ui-border))'
const BS = 'var(--m-dt-border-style,solid)'

export default () => ({
  slots: {
    wrapper: 'flex flex-col min-h-0 relative',
    base: 'border-separate border-spacing-0',
    tbody: 'divide-y-0',
    th: [
      `${PINNED}:sticky`,
      `[${PIN}]:bg-default`,
      PIN_SHADOW_COLOR,
      `${PINNED}:[--m-dt-pin-shadow:0_0_0_0_transparent]`,
      `${PINNED}:shadow-[var(--m-dt-pin-shadow)]`,
      PIN_L_EDGE,
      PIN_R_EDGE
    ].join(' '),
    td: [
      'empty:p-0',
      `${ROW_SEP}:border-t`,
      `${ROW_SEP}:border-default`,
      `${PINNED}:sticky`,
      `[${PIN}]:bg-default`,
      PIN_SHADOW_COLOR,
      `${PINNED}:[--m-dt-pin-shadow:0_0_0_0_transparent]`,
      `${PINNED}:shadow-[var(--m-dt-pin-shadow)]`,
      PIN_L_EDGE,
      PIN_R_EDGE,
      NOT_PIN_BG_SELECTED,
      PIN_BG_SELECTED,
      PIN_BG_HOVER
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
        root: [
          `border-[length:${BW}]`,
          `border-[color:${BC}]`,
          `[border-style:${BS}]`,
          'rounded-[var(--ui-radius)]'
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
        td: [
          `[[data-slot=tr]:nth-child(even)>${NOT_PIN}]:bg-[color:color-mix(in_oklab,var(--ui-bg-accented)_10%,transparent)]`,
          `[[data-slot=tr]:nth-child(even)>${PIN}]:bg-[color:color-mix(in_oklab,var(--ui-bg-accented)_10%,var(--ui-bg))]`
        ].join(' ')
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
