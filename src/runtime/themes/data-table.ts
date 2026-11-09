import { defineTheme } from '@nuxt/ui/utils/theme'

const ROW_SEP = '[[data-slot=table-tr]+[data-slot=table-tr]>&]'
const PINNED = 'data-[pinned]'
const PINNED_START = 'data-[pinned=start]'
const NOT_LAST_NOT_PIN = 'not-last:not-data-[pinned=start]:not-data-[pinned=end]'
const GROUP_HEADER = '[[data-slot=table-tr]:has([colspan])>&]'

// 真正固定的列(起始/末尾),区别于非固定列的 data-pinned="false"
const PIN = '&:is([data-pinned=start],[data-pinned=end])'
// 非固定的普通列,保留半透明行底色以适配任意容器背景
const NOT_PIN = '&[data-pinned]:not([data-pinned=start]):not([data-pinned=end])'
// 行状态下固定列的不透明底色,与半透明版同色但混入 --ui-bg-default 防止横向滚动透出
const PIN_BG_SELECTED = `[[data-selected=true]>${PIN}]:bg-[color:color-mix(in_oklab,var(--ui-bg-soft)_50%,var(--ui-bg-default))]`
const PIN_BG_HOVER = `[[data-slot=table-tr][data-selectable=true]:hover>${PIN}]:bg-[color:color-mix(in_oklab,var(--ui-bg-soft)_50%,var(--ui-bg-default))]`
const NOT_PIN_BG_SELECTED = `[[data-selected=true]>${NOT_PIN}]:bg-[color:color-mix(in_oklab,var(--ui-bg-soft)_50%,transparent)]`
// 固定列柔和分隔阴影色,可经 --m-dt-pin-shadow-color 覆盖
const PIN_SHADOW_COLOR = `[${PIN}]:[--m-dt-pin-shadow-color:color-mix(in_oklab,var(--ui-text-muted)_25%,transparent)]`
// 内容滚过起始侧时,最后一个起始固定列浮出朝内阴影
const PIN_START_EDGE = `[[data-pin-start]_&[data-pinned=start]:not(:has(+[data-pinned=start]))]:[--m-dt-pin-shadow:8px_0_10px_-8px_var(--m-dt-pin-shadow-color)]`
// 末尾侧尚有内容时,第一个末尾固定列浮出朝内阴影
const PIN_END_EDGE = `[[data-pin-end]_:not([data-pinned=end])+&[data-pinned=end]]:[--m-dt-pin-shadow:-8px_0_10px_-8px_var(--m-dt-pin-shadow-color)]`

const BW = 'var(--m-dt-border-width,1px)'
const BC = 'var(--m-dt-border-color,var(--ui-border-default))'
const BS = 'var(--m-dt-border-style,solid)'

export default defineTheme({
  slots: {
    wrapper: 'flex flex-col min-h-0 relative',
    toolbar: 'flex items-center justify-end gap-2 pb-2',
    skeleton: 'flex flex-col gap-2 py-1',
    skeletonRow: 'h-4 w-full',
    base: 'border-separate border-spacing-0',
    tbody: 'divide-y-0',
    th: [
      `${PINNED}:sticky`,
      `[${PIN}]:bg-default`,
      PIN_SHADOW_COLOR,
      `${PINNED}:[--m-dt-pin-shadow:0_0_0_0_transparent]`,
      `${PINNED}:shadow-[var(--m-dt-pin-shadow)]`,
      PIN_START_EDGE,
      PIN_END_EDGE
    ].join(' '),
    td: [
      `${ROW_SEP}:border-t`,
      `${ROW_SEP}:border-default`,
      `${PINNED}:sticky`,
      `[${PIN}]:bg-default`,
      PIN_SHADOW_COLOR,
      `${PINNED}:[--m-dt-pin-shadow:0_0_0_0_transparent]`,
      `${PINNED}:shadow-[var(--m-dt-pin-shadow)]`,
      PIN_START_EDGE,
      PIN_END_EDGE,
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
          `${PINNED_START}:shadow-[inset_-1px_0_0_${BC},var(--m-dt-pin-shadow)]`,
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
          `${PINNED_START}:shadow-[inset_-1px_0_0_${BC},var(--m-dt-pin-shadow)]`
        ].join(' ')
      }
    },
    striped: {
      true: {
        td: [
          `[[data-slot=table-tr]:nth-child(even)>${NOT_PIN}]:bg-[color:color-mix(in_oklab,var(--ui-bg-strong)_10%,transparent)]`,
          `[[data-slot=table-tr]:nth-child(even)>${PIN}]:bg-[color:color-mix(in_oklab,var(--ui-bg-strong)_10%,var(--ui-bg-default))]`
        ].join(' ')
      }
    },
    resizing: {
      true: {
        base: 'cursor-col-resize! select-none! [&_*]:cursor-col-resize! [&_*]:select-none!'
      }
    }
  }
})
