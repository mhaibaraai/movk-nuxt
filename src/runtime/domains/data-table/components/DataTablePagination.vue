<script setup lang="ts">
import type { PaginationProps } from '@nuxt/ui'
import type { PaginationState, Table } from '@tanstack/vue-table'
import { UPagination, USelect } from '#components'
import { useAppConfig } from '#imports'
import theme from '../../../../themes/data-table-pagination'
import { computed } from 'vue'
import { tv } from '@nuxt/ui/utils/tv'
import { resolvePageSizeValue } from '../state/pagination'
import type {
  DataTablePageSizeSelectProps,
  DataTablePaginationUiSlots,
  DataTablePaginationUiText
} from '../../../types/data-table'

interface PageSizeOption {
  label: string
  value: number
}

interface PaginationSummarySlotProps {
  summaryText: string
  selectedText: string
  selectedCount: number
  rowCount: number
  from: number
  to: number
  page: number
  pageCount: number
  showSelectedCount: boolean
}

interface PaginationActionsSlotProps {
  tableApi: Table<any>
  page: number
  pageCount: number
  pageSize: number
  rowCount: number
  pageSizes: number[]
  pageSizeOptions: PageSizeOption[]
  showPageSizeSelect: boolean
  setPage: (page: number) => void
  setPageSize: (pageSize: unknown) => void
}

const props = withDefaults(defineProps<{
  tableApi: Table<any>
  pagination: PaginationState
  page: number
  rowCount: number
  pageCount: number
  from: number
  to: number
  pageSizes?: number[]
  paginationProps?: Partial<Omit<PaginationProps, 'page' | 'total' | 'itemsPerPage'>>
  pageSizeSelectProps?: Partial<DataTablePageSizeSelectProps>
  selectedCount?: number
  showSelectedCount?: boolean
  showRowRange?: boolean
  text?: DataTablePaginationUiText
  ui?: DataTablePaginationUiSlots
}>(), {
  pageSizes: () => [],
  paginationProps: undefined,
  pageSizeSelectProps: undefined,
  selectedCount: 0,
  showSelectedCount: true,
  showRowRange: true,
  text: undefined,
  ui: undefined
})

defineSlots<{
  summary: (props: PaginationSummarySlotProps) => unknown
  actions: (props: PaginationActionsSlotProps) => unknown
}>()

const appConfig = useAppConfig()
const uiCls = computed(() =>
  tv({ extend: tv(theme), ...(appConfig.ui?.dataTablePagination || {}) })()
)

const pageModel = computed({
  get: () => props.page,
  set: (value: number) => {
    setPage(value)
  }
})

const text = computed<Required<DataTablePaginationUiText>>(() => ({
  total: props.text?.total ?? '共',
  item: props.text?.item ?? '条',
  range: props.text?.range ?? '显示',
  selected: props.text?.selected ?? '已选'
}))

const pageSizeOptions = computed<PageSizeOption[]>(() =>
  props.pageSizes.map(size => ({
    label: `${size} ${text.value.item}/页`,
    value: size
  }))
)

const showPageSizeSelect = computed(() => props.pageSizes.length > 1)
const pageSizeSelectAttrs = computed(() => ({
  ...props.pageSizeSelectProps,
  class: uiCls.value.pageSizeSelect({ class: props.pageSizeSelectProps?.class })
}))
const paginationAttrs = computed(() => ({
  ...props.paginationProps,
  class: uiCls.value.pagination({ class: props.paginationProps?.class })
}))
const summaryText = computed(() => {
  if (!props.showRowRange || props.rowCount === 0) {
    return `${text.value.total} ${props.rowCount} ${text.value.item}`
  }

  return `${text.value.range} ${props.from}-${props.to}，${text.value.total} ${props.rowCount} ${text.value.item}`
})
const selectedText = computed(() =>
  `${text.value.selected} ${props.selectedCount} ${text.value.item}`
)
const summarySlotProps = computed<PaginationSummarySlotProps>(() => ({
  summaryText: summaryText.value,
  selectedText: selectedText.value,
  selectedCount: props.selectedCount,
  rowCount: props.rowCount,
  from: props.from,
  to: props.to,
  page: props.page,
  pageCount: props.pageCount,
  showSelectedCount: props.showSelectedCount
}))
const actionsSlotProps = computed<PaginationActionsSlotProps>(() => ({
  tableApi: props.tableApi,
  page: props.page,
  pageCount: props.pageCount,
  pageSize: props.pagination.pageSize,
  rowCount: props.rowCount,
  pageSizes: props.pageSizes,
  pageSizeOptions: pageSizeOptions.value,
  showPageSizeSelect: showPageSizeSelect.value,
  setPage,
  setPageSize
}))

function setPage(value: number) {
  const nextPage = Math.floor(Number(value))

  if (!Number.isFinite(nextPage) || nextPage < 1) return

  const maxPage = Math.max(1, props.pageCount)
  const page = Math.min(maxPage, nextPage)
  props.tableApi.setPageIndex(page - 1)
}

function setPageSize(value: unknown) {
  const pageSize = resolvePageSizeValue(value)

  if (pageSize === null) return

  props.tableApi.setPageSize(pageSize)
}
</script>

<template>
  <div :class="uiCls.root({ class: props.ui?.root })">
    <div :class="uiCls.summary({ class: props.ui?.summary })">
      <slot name="summary" v-bind="summarySlotProps">
        <span :class="uiCls.summaryText({ class: props.ui?.summaryText })">{{ summaryText }}</span>
        <span
          v-if="showSelectedCount && selectedCount > 0"
          :class="uiCls.selectedCount({ class: props.ui?.selectedCount })"
        >
          {{ selectedText }}
        </span>
      </slot>
    </div>

    <div :class="uiCls.actions({ class: props.ui?.actions })">
      <slot name="actions" v-bind="actionsSlotProps">
        <USelect
          v-if="showPageSizeSelect"
          :model-value="pagination.pageSize"
          :items="pageSizeOptions"
          v-bind="pageSizeSelectAttrs"
          @update:model-value="setPageSize"
        />

        <UPagination
          v-model:page="pageModel"
          :total="rowCount"
          :items-per-page="pagination.pageSize"
          v-bind="paginationAttrs"
        />
      </slot>
    </div>
  </div>
</template>
