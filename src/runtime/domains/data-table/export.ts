import type { Column, Row, RowData, Table } from '@tanstack/vue-table'

export type DataTableExportRows = 'all' | 'selected' | 'page'

export interface DataTableCsvOptions {
  /** 导出的列 id，缺省时为当前可见的数据列（排除选择、序号等内置列） */
  columns?: string[]
  /**
   * 导出范围：全部（过滤排序后、分页前）、已选、当前页
   * @defaultValue 'all'
   */
  rows?: DataTableExportRows
}

export interface DataTableExportOptions extends DataTableCsvOptions {
  /**
   * 下载文件名
   * @defaultValue 'export.csv'
   */
  filename?: string
}

const SPECIAL_COLUMN_PREFIX = '__'

function escapeCell(value: unknown): string {
  if (value === null || value === undefined) return ''
  const text = typeof value === 'object' ? JSON.stringify(value) : String(value)
  return /[",\r\n]/.test(text) ? `"${text.replace(/"/g, '""')}"` : text
}

function headerOf<T extends RowData>(column: Column<T, unknown>): string {
  const header = column.columnDef.header
  return typeof header === 'string' ? header : column.id
}

function rowsOf<T extends RowData>(api: Table<T>, scope: DataTableExportRows): Row<T>[] {
  if (scope === 'selected') return api.getSelectedRowModel().flatRows
  if (scope === 'page') return api.getRowModel().flatRows
  return api.getPrePaginationRowModel().flatRows
}

/** 按列访问器取值生成 CSV 文本，单元格按 RFC 4180 转义 */
export function buildCsv<T extends RowData>(api: Table<T>, options: DataTableCsvOptions = {}): string {
  const columns = options.columns
    ? options.columns.map(id => api.getColumn(id)).filter((column): column is Column<T, unknown> => !!column)
    : api.getVisibleLeafColumns().filter(column => !column.id.startsWith(SPECIAL_COLUMN_PREFIX))

  const lines = [
    columns.map(column => escapeCell(headerOf(column))),
    ...rowsOf(api, options.rows ?? 'all').map(row => columns.map(column => escapeCell(row.getValue(column.id))))
  ]
  return lines.map(cells => cells.join(',')).join('\r\n')
}

/** 生成 CSV 并触发下载；带 BOM 以便 Excel 正确识别 UTF-8 */
export function downloadCsv<T extends RowData>(api: Table<T>, options: DataTableExportOptions = {}): void {
  const blob = new Blob([`\uFEFF${buildCsv(api, options)}`], { type: 'text/csv;charset=utf-8' })
  const url = URL.createObjectURL(blob)
  const link = document.createElement('a')
  link.href = url
  link.download = options.filename ?? 'export.csv'
  link.click()
  URL.revokeObjectURL(url)
}
