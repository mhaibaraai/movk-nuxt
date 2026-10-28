import { describe, expect, it } from 'vitest'
import { createTable, getCoreRowModel, getPaginationRowModel } from '@tanstack/vue-table'
import type { ColumnDef } from '@tanstack/vue-table'
import { buildCsv } from '../../../src/runtime/domains/data-table/export'

interface Row {
  id: number
  name: string
  note?: string
}

const data: Row[] = [
  { id: 1, name: 'a', note: 'x,y' },
  { id: 2, name: 'b "q"', note: 'line\nbreak' },
  { id: 3, name: 'c' }
]

const columns: ColumnDef<Row>[] = [
  { id: '__selection', header: '' },
  { accessorKey: 'id', header: 'ID' },
  { accessorKey: 'name', header: () => 'Name' },
  { accessorKey: 'note', header: 'Note' }
]

function create(rowSelection = {}, pagination = { pageIndex: 0, pageSize: 10 }) {
  return createTable<Row>({
    data,
    columns,
    state: { rowSelection, pagination, columnVisibility: {} },
    onStateChange: () => {},
    getCoreRowModel: getCoreRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    renderFallbackValue: null
  })
}

describe('buildCsv', () => {
  it('导出可见数据列并转义逗号、引号与换行，跳过内置列', () => {
    expect(buildCsv(create()).split('\r\n')).toEqual([
      'ID,name,Note',
      '1,a,"x,y"',
      '2,"b ""q""","line\nbreak"',
      '3,c,'
    ])
  })

  it('支持指定列与已选行', () => {
    expect(buildCsv(create({ 0: true, 2: true }), { columns: ['name'], rows: 'selected' })).toBe('name\r\na\r\nc')
  })

  it('page 只导出当前页', () => {
    expect(buildCsv(create({}, { pageIndex: 1, pageSize: 2 }), { columns: ['id'], rows: 'page' })).toBe('ID\r\n3')
  })
})
