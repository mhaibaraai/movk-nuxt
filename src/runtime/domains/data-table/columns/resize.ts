import type { HeaderContext } from '@tanstack/vue-table'
import type { CSSProperties, VNode } from 'vue'
import { h } from 'vue'
import type { DataTableProps } from '../../../types/data-table/component'
import { clampSize } from './style'

// 视为「拖动」而非「点击」的最小位移，避免误触把自适应列定宽
const DRAG_THRESHOLD = 2

// runtime/domains 不在 Tailwind @source 扫描范围，cursor-col-resize 等工具类不会生成，故关键视觉走内联 style
const HANDLE_STYLE: CSSProperties = {
  position: 'absolute',
  insetBlock: '0',
  right: '0',
  width: '14px',
  cursor: 'col-resize',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'flex-end',
  zIndex: '15',
  touchAction: 'none',
  userSelect: 'none'
}

const BADGE_STYLE: CSSProperties = {
  position: 'absolute',
  top: '50%',
  right: '0',
  transform: 'translateY(-50%)',
  marginRight: '6px',
  padding: '2px 6px',
  borderRadius: '4px',
  backgroundColor: 'var(--ui-primary)',
  color: 'var(--ui-text-inverted)',
  fontSize: '12px',
  fontWeight: '500',
  lineHeight: '1',
  whiteSpace: 'nowrap',
  fontVariantNumeric: 'tabular-nums',
  pointerEvents: 'none',
  zIndex: '20'
}

function lineStyle(active: boolean): CSSProperties {
  return {
    width: active ? '2px' : '1px',
    height: '60%',
    marginRight: '3px',
    borderRadius: '1px',
    backgroundColor: active ? 'var(--ui-primary)' : 'var(--ui-border-accented)',
    opacity: active ? '1' : '0.6',
    transition: 'background-color 0.15s, width 0.15s, opacity 0.15s'
  }
}

function highlightLine(handle: HTMLElement | null, active: boolean): void {
  const line = handle?.firstElementChild as HTMLElement | null
  if (line) Object.assign(line.style, lineStyle(active))
}

function clientXOf(e: MouseEvent | TouchEvent): number | undefined {
  return 'touches' in e ? e.touches[0]?.clientX : e.clientX
}

// 自管拖拽：以实测起始宽 + 指针位移驱动 columnSizing（不走 TanStack getResizeHandler，避免其默认 150 起拖吸附），按 [min, max] 自夹
function startResize<T>(ctx: HeaderContext<T, unknown>, options: DataTableProps<T>, e: MouseEvent | TouchEvent): void {
  const id = ctx.column.id
  const th = (e.currentTarget as HTMLElement | null)?.closest('th')
  const startWidth = th ? th.getBoundingClientRect().width : ctx.column.getSize()
  const startX = clientXOf(e) ?? 0
  const min = ctx.column.columnDef.minSize ?? 20
  const max = ctx.column.columnDef.maxSize ?? Number.MAX_SAFE_INTEGER
  const liveMode = (options.columnResizeMode ?? 'onChange') === 'onChange'
  e.preventDefault()

  let moved = false
  let lastX = startX
  let rafId = 0
  const widthAt = (x: number): number => clampSize(Math.round(startWidth + (x - startX)), min, max)
  const apply = (): void => {
    rafId = 0
    ctx.table.setColumnSizing(prev => ({ ...prev, [id]: widthAt(lastX) }))
  }

  // 表格 min-w-full + auto 布局下，拖宽一列时左侧自适应列会收缩维持总宽，使分隔线落后于光标。
  // 把左侧叶子列按实测宽冻结后，分隔线 = 左侧固定宽之和 + 被拖列宽，与光标 1:1 跟随；右侧自适应列吸收变化。
  const freezeLeftColumns = (): void => {
    const tr = th?.closest('tr')
    const headers = ctx.table.getHeaderGroups().at(-1)?.headers ?? []
    const draggedIndex = headers.findIndex(hd => hd.column.id === id)
    if (!tr || draggedIndex <= 0) return
    const ths = Array.from(tr.querySelectorAll(':scope > th')) as HTMLElement[]
    const frozen: Record<string, number> = {}
    for (let i = 0; i < draggedIndex; i++) {
      const el = ths[i]
      const hd = headers[i]
      if (el && hd) frozen[hd.column.id] = Math.round(el.getBoundingClientRect().width)
    }
    if (Object.keys(frozen).length) ctx.table.setColumnSizing(prev => ({ ...prev, ...frozen }))
  }

  const stop = (): void => {
    window.removeEventListener('mousemove', onMove)
    window.removeEventListener('mouseup', onEnd)
    window.removeEventListener('touchmove', onMove)
    window.removeEventListener('touchend', onEnd)
  }

  const onMove = (ev: MouseEvent | TouchEvent): void => {
    const x = clientXOf(ev)
    if (typeof x !== 'number') return
    if (!moved) {
      if (Math.abs(x - startX) <= DRAG_THRESHOLD) return
      moved = true
      freezeLeftColumns()
      ctx.table.setColumnSizingInfo(prev => ({ ...prev, isResizingColumn: id }))
    }
    lastX = x
    // rAF 节流：每帧最多一次 setColumnSizing，避免事件频率刷爆整表重渲染与重排
    if (liveMode && !rafId) rafId = requestAnimationFrame(apply)
  }

  const onEnd = (ev: MouseEvent | TouchEvent): void => {
    if (rafId) cancelAnimationFrame(rafId)
    if (moved) {
      const x = clientXOf(ev)
      if (typeof x === 'number') lastX = x
      ctx.table.setColumnSizing(prev => ({ ...prev, [id]: widthAt(lastX) }))
      ctx.table.setColumnSizingInfo(prev => ({ ...prev, isResizingColumn: false }))
    }
    stop()
  }

  window.addEventListener('mousemove', onMove)
  window.addEventListener('mouseup', onEnd)
  window.addEventListener('touchmove', onMove)
  window.addEventListener('touchend', onEnd)
}

// 列宽拖拽手柄：命中区落在 <th> 右 padding 区（紧贴分隔线、不越界叠到右侧固定列），手柄锚定已 relative/sticky 的 <th>
export function buildResizeHandle<T>(ctx: HeaderContext<T, unknown>, options: DataTableProps<T>): VNode {
  const isResizing = ctx.column.getIsResizing()
  return h('div', {
    style: HANDLE_STYLE,
    onMousedown: (e: MouseEvent) => startResize(ctx, options, e),
    onTouchstart: (e: TouchEvent) => startResize(ctx, options, e),
    onClick: (e: Event) => e.stopPropagation(),
    onMouseenter: (e: MouseEvent) => { if (!isResizing) highlightLine(e.currentTarget as HTMLElement, true) },
    onMouseleave: (e: MouseEvent) => { if (!isResizing) highlightLine(e.currentTarget as HTMLElement, false) }
  }, [
    h('div', { style: lineStyle(isResizing) }),
    isResizing ? h('div', { style: BADGE_STYLE }, `${Math.round(ctx.column.getSize())}px`) : null
  ])
}
