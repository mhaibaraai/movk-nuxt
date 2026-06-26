import { describe, expect, it, vi } from 'vitest'
import { resolveColumns } from '../../../src/runtime/domains/data-table/columns/resolve-columns'
import { clampSize, resolveColumnSize } from '../../../src/runtime/domains/data-table/columns/style'
import type { DataTableColumn } from '../../../src/runtime/types/data-table'
import type { DataTableProps } from '../../../src/runtime/types/data-table/component'

vi.mock('#components', () => ({ UButton: 'UButton', UCheckbox: 'UCheckbox', UDropdownMenu: 'UDropdownMenu' }))
vi.mock('../../../src/runtime/domains/data-table/components/CellTooltip.vue', () => ({ default: 'CellTooltip' }))
vi.mock('../../../src/runtime/domains/data-table/components/ActionsCell.vue', () => ({ default: 'ActionsCell' }))

interface Row {
  id: string
  name: string
}

function resolve(columns: DataTableColumn<Row>[]) {
  return resolveColumns<Row>(columns, {} as DataTableProps<Row>)
}

function findDef(columns: DataTableColumn<Row>[], id: string) {
  return resolve(columns).columnDefs.find(d => d.id === id || (d as { accessorKey?: string }).accessorKey === id)
}

describe('resolveColumns 列尺寸解析', () => {
  it('特殊列只给 minSize 时不注入默认 size，且不进 initialSizing', () => {
    const cols: DataTableColumn<Row>[] = [{ type: 'actions', minSize: 60, actions: [] }]
    const { columnDefs, initialSizing } = resolve(cols)
    const def = columnDefs.find(d => d.id === '__actions')!
    expect(def.minSize).toBe(60)
    expect(def.size).toBeUndefined()
    expect('__actions' in initialSizing).toBe(false)
  })

  it('特殊列无 size 无 bounds 时回退默认 size 60 并写入 initialSizing', () => {
    const cols: DataTableColumn<Row>[] = [{ type: 'actions', actions: [] }]
    const { columnDefs, initialSizing } = resolve(cols)
    const def = columnDefs.find(d => d.id === '__actions')!
    expect(def.size).toBe(60)
    expect(initialSizing.__actions).toBe(60)
  })

  it('特殊列 maxSize 同样不注入默认 size', () => {
    const cols: DataTableColumn<Row>[] = [{ type: 'selection', maxSize: 120 }]
    const def = resolve(cols).columnDefs.find(d => d.id === '__selection')!
    expect(def.maxSize).toBe(120)
    expect(def.size).toBeUndefined()
  })

  it('数据列只给 maxSize 时保持自适应（无 size、不进 sizing）', () => {
    const cols: DataTableColumn<Row>[] = [{ accessorKey: 'name', header: '名称', maxSize: 200 }]
    const { initialSizing } = resolve(cols)
    const def = findDef(cols, 'name')!
    expect(def.maxSize).toBe(200)
    expect(def.size).toBeUndefined()
    expect('name' in initialSizing).toBe(false)
  })
})

interface MockColumnOptions {
  id: string
  columnDef: { size?: number, minSize?: number, maxSize?: number }
  size: number
  pinned?: 'left' | 'right' | false
  columnSizing?: Record<string, number>
  leftLeafIds?: string[]
  rightLeafIds?: string[]
}

function makeCtx(opts: MockColumnOptions) {
  const column = {
    id: opts.id,
    // TanStack 把默认 columnDef（size: 150）合并进 column.columnDef，未显式设 size 即等于默认值
    columnDef: { size: 150, ...opts.columnDef },
    getSize: () => opts.size,
    getIsPinned: () => opts.pinned ?? false
  }
  const table = {
    getState: () => ({ columnSizing: opts.columnSizing ?? {} }),
    _getDefaultColumnDef: () => ({ size: 150 }),
    getLeftLeafColumns: () => (opts.leftLeafIds ?? []).map(id => ({ id })),
    getRightLeafColumns: () => (opts.rightLeafIds ?? []).map(id => ({ id }))
  }
  return { column, getContext: () => ({ table }) } as never
}

describe('resolveColumnSize 渲染宽度', () => {
  it('普通列只有 minSize → 仅 minWidth，无固定 width', () => {
    const style = resolveColumnSize(makeCtx({
      id: 'name',
      columnDef: { minSize: 60 },
      size: 150
    }))
    expect(style).toEqual({ minWidth: '60px' })
  })

  it('右固定唯一列 + minSize 无显式宽 → 自适应（仅 minWidth）', () => {
    const style = resolveColumnSize(makeCtx({
      id: '__actions',
      columnDef: { minSize: 60 },
      size: 150,
      pinned: 'right',
      rightLeafIds: ['__actions']
    }))
    expect(style).toEqual({ minWidth: '60px' })
  })

  it('右固定但存在更内侧固定列（非内侧）→ 固定宽', () => {
    const style = resolveColumnSize(makeCtx({
      id: '__actions',
      columnDef: {},
      size: 150,
      pinned: 'right',
      rightLeafIds: ['__inner', '__actions']
    }))
    expect(style).toEqual({ width: '150px', minWidth: '150px', maxWidth: '150px' })
  })

  it('显式 size 超过 maxSize → clamp 到 maxSize', () => {
    const style = resolveColumnSize(makeCtx({
      id: 'bio',
      columnDef: { size: 300, maxSize: 200 },
      size: 300
    }))
    expect(style).toEqual({ width: '200px', minWidth: '200px', maxWidth: '200px' })
  })

  it('已拖拽测量（columnSizing 命中）→ 固定宽并按 minSize 收敛', () => {
    const style = resolveColumnSize(makeCtx({
      id: 'name',
      columnDef: { minSize: 80 },
      size: 50,
      columnSizing: { name: 50 }
    }))
    expect(style).toEqual({ width: '80px', minWidth: '80px', maxWidth: '80px' })
  })

  it('自适应列种入测量宽（columnSizing 命中、无显式 size）→ 仅守 minSize 不被 maxSize 夹回', () => {
    const style = resolveColumnSize(makeCtx({
      id: 'bio',
      columnDef: { maxSize: 200 },
      size: 284,
      columnSizing: { bio: 284 }
    }))
    expect(style).toEqual({ width: '284px', minWidth: '284px', maxWidth: '284px' })
  })

  it('自适应列种入测量宽且有 minSize → 收敛到 minSize 下限', () => {
    const style = resolveColumnSize(makeCtx({
      id: 'bio',
      columnDef: { minSize: 140, maxSize: 200 },
      size: 120,
      columnSizing: { bio: 120 }
    }))
    expect(style).toEqual({ width: '140px', minWidth: '140px', maxWidth: '140px' })
  })
})

describe('clampSize 拖拽目标宽度', () => {
  it('区间内原样返回', () => {
    expect(clampSize(180, 60, 320)).toBe(180)
  })

  it('超过 maxSize 夹到上限', () => {
    expect(clampSize(400, 60, 320)).toBe(320)
  })

  it('低于 minSize 夹到下限', () => {
    expect(clampSize(40, 60, 320)).toBe(60)
  })
})
