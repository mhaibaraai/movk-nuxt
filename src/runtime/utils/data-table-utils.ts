import type { ColumnDefTemplate, ExpandedState, PaginationState, RowSelectionState, VisibilityState } from '@tanstack/vue-table'
import type { Ref, WritableComputedRef } from 'vue'
import { computed, onMounted, watch } from 'vue'
import { isFunction, isString } from '@movk/core'
import type { TableData } from '@nuxt/ui'
import type { DataTableDataColumn, DataTablePaginationUi, DataTableSizePreset } from '../types/data-table'
import { SIZE_PRESET_MAP } from '../constants/data-table'

/**
 * 统一处理「值或回调」模式
 *
 * 用于 rowClass、disabled、hidden、actions 等 8+ 处
 */
export function resolveCallbackValue<V, A>(valueOrFn: V | ((arg: A) => V), arg: A): V {
  return isFunction(valueOrFn) ? valueOrFn(arg) : valueOrFn
}

/**
 * 解析列级布尔配置（pinable / sortable / resizable）
 *
 * 优先级：列级显式值 > 全局函数/值 > fallback
 */
export function resolveColumnFlag<T>(
  colValue: boolean | undefined,
  globalValue: boolean | ((col: DataTableDataColumn<T>) => boolean) | undefined,
  col: DataTableDataColumn<T>,
  fallback = false
): boolean {
  if (colValue !== undefined) return colValue
  if (typeof globalValue === 'function') return globalValue(col)
  return globalValue ?? fallback
}

/**
 * 解析 TanStack ColumnDefTemplate：string 直接返回，function 则传入 props 调用
 */
export function resolveTemplate<TProps extends object>(
  template: ColumnDefTemplate<TProps>,
  props: TProps
): unknown {
  return isFunction(template) ? template(props) : template
}

/**
 * 将预设字符串或数值解析为 TanStack 的数值 size
 */
export function resolvePresetSize(size: number | DataTableSizePreset): number {
  return isString(size) ? SIZE_PRESET_MAP[size] : size
}

/**
 * 生成用于强制重建 UTable 的紧凑 key
 *
 * `columnResizeMode` 直接编码为前缀，其余布尔开关用位掩码压缩，
 * 避免在 DOM 中出现冗长的 `true|false|...` 字符串。
 */
export function resolveTableResetKey(options: {
  columnResizeMode: 'onChange' | 'onEnd'
  resizable: boolean
  sortable: boolean
  pinable: boolean
  hasColumnPinning: boolean
  hasColumnResizing: boolean
  hasColumnSort: boolean
  manualPagination: boolean
}): string {
  const flags = [
    options.resizable,
    options.sortable,
    options.pinable,
    options.hasColumnPinning,
    options.hasColumnResizing,
    options.hasColumnSort,
    options.manualPagination
  ].reduce((mask, enabled, index) => mask | ((enabled ? 1 : 0) << index), 0)

  return `${options.columnResizeMode === 'onEnd' ? 'e' : 'c'}${flags.toString(36)}`
}

/**
 * 判断两个 key 数组是否集合相等（忽略顺序）
 */
export function areSameKeys(a: readonly (string | number)[], b: readonly (string | number)[]): boolean {
  if (a.length !== b.length) return false
  const set = new Set(a.map(String))
  for (const key of b) {
    if (!set.has(String(key))) return false
  }
  return true
}

/**
 * 选中行 id 数组 → TanStack RowSelectionState
 */
export function keysToRowSelection(keys: (string | number)[]): RowSelectionState {
  const state: RowSelectionState = {}
  for (const key of keys) {
    state[String(key)] = true
  }
  return state
}

/**
 * RowSelectionState → 选中行 id 数组
 *
 * 当 `getRowId` 未覆盖 TanStack 默认行为时，可通过 `idMap` 传入
 * 「内部 id → 外部 key」映射恢复业务字段。
 */
export function rowSelectionToKeys(
  state: RowSelectionState,
  idMap?: ReadonlyMap<string, string | number>
): (string | number)[] {
  return Object.entries(state)
    .filter(([, selected]) => selected)
    .map(([key]) => (idMap ? idMap.get(key) : key))
    .filter((key): key is string | number => key !== undefined)
}

/**
 * 可见列白名单数组 → TanStack VisibilityState
 *
 * 遍历 `allColumnIds`，命中 `keys` 的置 true，未命中的显式置 false
 * （覆盖 TanStack「缺失 key = 可见」的默认约定）。
 */
export function keysToVisibility(keys: string[], allColumnIds: string[]): VisibilityState {
  const set = new Set(keys)
  const state: VisibilityState = {}
  for (const id of allColumnIds) {
    state[id] = set.has(id)
  }
  return state
}

/**
 * VisibilityState → 可见列白名单数组
 *
 * 遍历 `allColumnIds`，`state[id] !== false` 视为可见。
 */
export function visibilityToKeys(state: VisibilityState, allColumnIds: string[]): string[] {
  return allColumnIds.filter(id => state[id] !== false)
}

/**
 * 可见列黑名单数组 → TanStack VisibilityState
 *
 * 遍历 `allColumnIds`，命中 `excludeKeys` 的置 false，未命中的显式置 true。
 */
export function keysToVisibilityExclude(excludeKeys: string[], allColumnIds: string[]): VisibilityState {
  const set = new Set(excludeKeys)
  const state: VisibilityState = {}
  for (const id of allColumnIds) {
    state[id] = !set.has(id)
  }
  return state
}

/**
 * VisibilityState → 可见列黑名单数组
 *
 * 遍历 `allColumnIds`，`state[id] === false` 视为隐藏。
 */
export function visibilityToExcludeKeys(state: VisibilityState, allColumnIds: string[]): string[] {
  return allColumnIds.filter(id => state[id] === false)
}

/**
 * 展开行 id 数组 → Record<id, true>
 */
export function keysToExpanded(keys: string[]): Record<string, boolean> {
  const state: Record<string, boolean> = {}
  for (const key of keys) {
    state[key] = true
  }
  return state
}

/**
 * ExpandedState → 展开行 id 数组
 *
 * `state === true`（全部展开）时返回空数组并打印警告 —— 数组形式无法表达
 * 「全部展开」语义，需要此行为时请使用对象形 `v-model:expanded` 绑定 true。
 */
export function expandedToKeys(state: ExpandedState): string[] {
  if (state === true) {
    console.warn('[DataTable] expandedKeys cannot represent expanded=true; use v-model:expanded for expand-all')
    return []
  }
  return Object.entries(state)
    .filter(([, expanded]) => expanded)
    .map(([key]) => key)
}

/**
 * 通用的「model 回退到默认值 + mount 时回写」
 *
 * 解决 writable computed 的 get 回退到 fallback 时，TanStack 内部不会触发 set，
 * 导致父组件 model 始终为 undefined 的问题。
 *
 * `syncBack` 为 true 或返回 true 时，mount 阶段主动将默认值写入 model。
 */
export function useEffectiveModel<T>(
  model: Ref<T | undefined>,
  getDefault: () => T,
  syncBack?: boolean | ((value: T) => boolean)
): WritableComputedRef<T> {
  const effective = computed<T>({
    get: () => model.value !== undefined ? model.value : getDefault(),
    set: (v) => { model.value = v }
  })

  if (syncBack !== undefined) {
    onMounted(() => {
      if (model.value !== undefined) return
      const defaults = getDefault()
      const shouldSync = typeof syncBack === 'function' ? syncBack(defaults) : syncBack
      if (shouldSync) {
        model.value = defaults
      }
    })
  }

  return effective
}

/**
 * 通用的「数组 keys ↔ 对象 record」双向同步
 *
 * 使用闭包 `updating` 标志防循环，`areSameKeys` 短路避免集合相同仅顺序变化时的无效回写。
 */
export function useSyncKeys<R>(
  keys: Ref<string[] | undefined>,
  record: Ref<R | undefined>,
  toRecord: (keys: string[]) => R,
  toKeys: (record: R) => string[]
): void {
  let updating = false

  watch(keys, (next) => {
    if (updating) return
    const current = record.value !== undefined ? toKeys(record.value) : []
    if (areSameKeys(current, next ?? [])) return
    updating = true
    record.value = toRecord(next ?? [])
    updating = false
  }, { deep: true })

  watch(record, (next) => {
    if (updating) return
    if (next === undefined) return
    const derived = toKeys(next)
    if (areSameKeys(derived, keys.value ?? [])) return
    updating = true
    keys.value = derived
    updating = false
  }, { deep: true })
}

/**
 * 根据选中行 id 列表 + 源数据，派生出选中行对象数组
 *
 * 支持树形：传入 `childrenKey` 时递归遍历子行。
 */
export function useSelectedRows<T extends Record<string, unknown>>(
  data: Ref<T[]> | (() => T[]),
  selectedKeys: Ref<(string | number)[]>,
  rowKey: string,
  childrenKey?: string
) {
  return computed(() => {
    const rows = typeof data === 'function' ? data() : data.value
    const keySet = new Set(selectedKeys.value.map(String))

    if (!childrenKey) {
      return rows.filter(row => keySet.has(String(row[rowKey])))
    }

    const selectedRows: T[] = []
    const walk = (items: T[]) => {
      for (const item of items) {
        if (keySet.has(String(item[rowKey]))) {
          selectedRows.push(item)
        }
        const children = item[childrenKey]
        if (Array.isArray(children) && children.length > 0) {
          walk(children as T[])
        }
      }
    }
    walk(rows)
    return selectedRows
  })
}

const DEFAULT_PAGE_SIZE = 10

interface DataTablePaginationSnapshot {
  pagination?: Partial<PaginationState>
  rowCount: number
  pageCount: number
  currentPageRowCount: number
}

interface DataTablePaginationSnapshotOptions {
  manualPagination?: boolean
  rowCount?: number
  pageCount?: number
}

interface DataTablePaginationViewState {
  pagination: PaginationState
  page: number
  rowCount: number
  pageCount: number
  currentPageRowCount: number
  from: number
  to: number
  show: boolean
}

export function resolvePaginationViewState(
  snapshot: DataTablePaginationSnapshot,
  paginationUi?: DataTablePaginationUi
): DataTablePaginationViewState {
  const pageIndex = snapshot.pagination?.pageIndex ?? 0
  const pageSize = snapshot.pagination?.pageSize ?? DEFAULT_PAGE_SIZE
  const rowCount = Math.max(0, snapshot.rowCount)
  const currentPageRowCount = Math.max(0, snapshot.currentPageRowCount)
  const pageCount = Math.max(0, snapshot.pageCount)
  const from = rowCount > 0 && currentPageRowCount > 0
    ? pageIndex * pageSize + 1
    : 0
  const to = rowCount > 0 && currentPageRowCount > 0
    ? Math.min(rowCount, from + currentPageRowCount - 1)
    : 0

  return {
    pagination: {
      pageIndex,
      pageSize
    },
    page: pageIndex + 1,
    rowCount,
    pageCount,
    currentPageRowCount,
    from,
    to,
    show: paginationUi?.show ?? (pageCount > 1 || (paginationUi?.pageSizes?.length ?? 0) > 1)
  }
}

export function resolveSelectedCount(
  rowSelectionKeys?: string[],
  rowSelectionState?: RowSelectionState
): number {
  if (rowSelectionKeys !== undefined) {
    return rowSelectionKeys.length
  }

  return Object.keys(rowSelectionState ?? {}).length
}

export function resolvePageSizeValue(value: unknown): number | null {
  if (value === '' || value === null || value === undefined) {
    return null
  }

  const pageSize = Math.floor(Number(value))

  if (!Number.isFinite(pageSize) || pageSize <= 0) {
    return null
  }

  return pageSize
}

export function createPaginationSnapshot<T extends TableData>(
  tableApi: import('@tanstack/vue-table').Table<T> | null,
  options?: DataTablePaginationSnapshotOptions
): DataTablePaginationSnapshot {
  if (!tableApi) {
    return {
      pagination: undefined,
      rowCount: Math.max(0, options?.rowCount ?? 0),
      pageCount: Math.max(0, options?.pageCount ?? 0),
      currentPageRowCount: 0
    }
  }

  const pagination = tableApi.getState().pagination
  const currentPageRowCount = tableApi.getRowModel().rows.length
  const fallbackRowCount = tableApi.getRowCount()
  const fallbackPageCount = tableApi.getPageCount()
  const explicitRowCount = options?.rowCount
  const explicitPageCount = options?.pageCount
  const pageSize = pagination?.pageSize ?? DEFAULT_PAGE_SIZE
  const rowCount = options?.manualPagination
    ? Math.max(0, explicitRowCount ?? fallbackRowCount)
    : fallbackRowCount
  const pageCount = options?.manualPagination
    ? Math.max(
        0,
        explicitPageCount
        ?? (explicitRowCount !== undefined ? Math.ceil(Math.max(0, explicitRowCount) / pageSize) : fallbackPageCount)
      )
    : fallbackPageCount

  return {
    pagination,
    rowCount,
    pageCount,
    currentPageRowCount
  }
}
