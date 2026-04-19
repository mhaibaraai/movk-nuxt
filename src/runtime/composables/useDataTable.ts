import type { ComputedRef, MaybeRefOrGetter, Ref, ShallowRef } from 'vue'
import type {
  ColumnPinningState,
  ColumnSizingState,
  RowPinningState,
  SortingState,
  VisibilityState
} from '@tanstack/vue-table'
import type { DataTableColumn, DataTableExpose } from '../types/data-table'
import type { UseApiFetchOptions } from '../types/api'
import { computed, isRef, ref, shallowRef, toValue, unref, watch } from 'vue'
import { useSelectedRows } from '../utils/data-table-utils'

export interface UseDataTableOptions<T, TResponse = unknown> {
  /** API 路径（启用后自动用 useApiFetch 获取数据） */
  api?: string | MaybeRefOrGetter<string>
  /** useApiFetch 额外选项 */
  apiOptions?: Omit<UseApiFetchOptions<TResponse>, 'query' | 'watch'>
  /** 本地数据（与 api 二选一） */
  data?: Ref<T[]> | T[]

  /** 列定义 */
  columns: DataTableColumn<T>[]
  /** 行唯一标识，默认 'id' */
  rowKey?: keyof T & string

  /** 分页初始状态 */
  pagination?: { page?: number, size?: number }

  /** 默认排序 */
  defaultSort?: { key: string, order: 'asc' | 'desc' }

  /** 搜索参数（由 SearchForm 绑定） */
  searchParams?: Ref<Record<string, unknown>>

  /** 从 API 响应中提取数据数组 */
  dataExtractor?: (response: TResponse) => T[]
  /** 从 API 响应中提取总条数 */
  totalExtractor?: (response: TResponse) => number
}

export interface UseDataTableReturn<T> {
  /** 可直接 v-bind 到 MDataTable 的 props 对象 */
  tableProps: ComputedRef<{
    data: T[]
    columns: DataTableColumn<T>[]
    loading: boolean
    total: number
    page: number
    pageSize: number
    sorting: SortingState
    columnVisibility: VisibilityState
    columnPinning: ColumnPinningState
    columnSizing: ColumnSizingState
    rowPinning: RowPinningState
    selectedKeys: (string | number)[]
    rowKey: string
  }>

  data: ComputedRef<T[]>
  loading: Ref<boolean>
  total: ComputedRef<number>

  page: Ref<number>
  pageSize: Ref<number>

  selectedKeys: Ref<(string | number)[]>
  selectedRows: ComputedRef<T[]>
  clearSelection: () => void

  sorting: Ref<SortingState>
  columnVisibility: Ref<VisibilityState>
  columnPinning: Ref<ColumnPinningState>
  columnSizing: Ref<ColumnSizingState>
  rowPinning: Ref<RowPinningState>

  refresh: () => Promise<void>
  tableRef: ShallowRef<DataTableExpose<T> | null>
}

function defaultDataExtractor<T>(resp: unknown): T[] {
  if (resp && typeof resp === 'object' && 'content' in resp) {
    return (resp as { content: T[] }).content ?? []
  }
  return []
}

function defaultTotalExtractor(resp: unknown): number {
  if (resp && typeof resp === 'object' && 'page' in resp) {
    const page = (resp as { page: { totalElements?: number } }).page
    return page?.totalElements ?? 0
  }
  return 0
}

export function useDataTable<T extends Record<string, unknown>, TResponse = unknown>(
  options: UseDataTableOptions<T, TResponse>
): UseDataTableReturn<T> {
  const rowKey = options.rowKey

  // Pagination state
  const page = ref(options.pagination?.page ?? 1)
  const pageSize = ref(options.pagination?.size ?? 20)

  // Sorting state
  const sorting = ref<SortingState>(
    options.defaultSort
      ? [{ id: options.defaultSort.key, desc: options.defaultSort.order === 'desc' }]
      : []
  )

  // Column visibility
  const columnVisibility = ref<VisibilityState>({})

  // Pinning and sizing state
  const columnPinning = ref<ColumnPinningState>({ left: [], right: [] })
  const columnSizing = ref<ColumnSizingState>({})
  const rowPinning = ref<RowPinningState>({ top: [], bottom: [] })

  // Selection state
  const selectedKeys = ref<(string | number)[]>([])

  // Table ref
  const tableRef = shallowRef<DataTableExpose<T> | null>(null)

  // Loading state
  const loading = ref(false)

  // API response data
  const responseData = ref<T[]>([]) as Ref<T[]>
  const responseTotal = ref(0)

  // Extractors
  const dataExtractor = options.dataExtractor ?? defaultDataExtractor as (resp: TResponse) => T[]
  const totalExtractor = options.totalExtractor ?? defaultTotalExtractor as (resp: TResponse) => number

  // Refresh function
  let refreshFn: (() => Promise<void>) | null = null

  // Reset page when search params change
  if (options.searchParams) {
    watch(options.searchParams, () => {
      page.value = 1
      selectedKeys.value = []
    }, { deep: true })
  }

  // API mode
  if (options.api) {
    const sortQueryString = computed(() => {
      if (sorting.value.length === 0) return undefined
      const s = sorting.value[0]!
      return `${s.id},${s.desc ? 'desc' : 'asc'}`
    })

    const query = computed(() => ({
      page: page.value - 1,
      size: pageSize.value,
      ...(sortQueryString.value && { sort: sortQueryString.value }),
      ...(options.searchParams ? unref(options.searchParams) : {})
    }))

    // Dynamic import to avoid hard dependency
    const setupApi = async () => {
      const { useApiFetch } = await import('./useApiFetch')
      const apiPath = () => toValue(options.api!)

      const { data: response, status, refresh } = useApiFetch<TResponse>(
        apiPath,
        {
          query,
          watch: [query],
          toast: false,
          ...options.apiOptions
        } as UseApiFetchOptions<TResponse>
      )

      watch(status, (s) => {
        loading.value = s === 'pending'
      }, { immediate: true })

      watch(response, (resp) => {
        if (resp) {
          responseData.value = dataExtractor(resp as TResponse)
          responseTotal.value = totalExtractor(resp as TResponse)
        }
      }, { immediate: true })

      refreshFn = async () => {
        await refresh()
      }
    }

    setupApi()
  }

  // Local data mode
  const data = computed<T[]>(() => {
    if (options.api) return responseData.value
    const localData = options.data
    return localData ? (isRef(localData) ? localData.value : localData) : []
  })

  const total = computed(() => {
    if (options.api) return responseTotal.value
    return data.value.length
  })

  // Selected rows
  const selectedRows = useSelectedRows(
    () => data.value,
    selectedKeys,
    (rowKey ?? 'id') as string
  )

  function clearSelection() {
    selectedKeys.value = []
  }

  async function refresh() {
    if (refreshFn) {
      await refreshFn()
    }
  }

  // Table props (v-bind ready)
  const tableProps = computed(() => ({
    'data': data.value,
    'columns': options.columns,
    'loading': loading.value,
    'total': total.value,
    'page': page.value,
    'pageSize': pageSize.value,
    'sorting': sorting.value,
    'columnVisibility': columnVisibility.value,
    'columnPinning': columnPinning.value,
    'columnSizing': columnSizing.value,
    'rowPinning': rowPinning.value,
    'selectedKeys': selectedKeys.value,
    ...(rowKey && { rowKey: rowKey as string }),
    'onUpdate:page': (v: number) => { page.value = v },
    'onUpdate:pageSize': (v: number) => { pageSize.value = v },
    'onUpdate:sorting': (v: SortingState) => { sorting.value = v },
    'onUpdate:columnVisibility': (v: VisibilityState) => { columnVisibility.value = v },
    'onUpdate:columnPinning': (v: ColumnPinningState) => { columnPinning.value = v },
    'onUpdate:columnSizing': (v: ColumnSizingState) => { columnSizing.value = v },
    'onUpdate:rowPinning': (v: RowPinningState) => { rowPinning.value = v },
    'onUpdate:selectedKeys': (v: (string | number)[]) => { selectedKeys.value = v }
  }))

  return {
    tableProps,
    data,
    loading,
    total,
    page,
    pageSize,
    selectedKeys,
    selectedRows,
    clearSelection,
    sorting,
    columnVisibility,
    columnPinning,
    columnSizing,
    rowPinning,
    refresh,
    tableRef
  }
}
