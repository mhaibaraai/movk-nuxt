<script lang="ts" setup generic="T extends TableData">
import type { ComponentConfig, TableData } from '@nuxt/ui'
import type { AppConfig } from 'nuxt/schema'
import { UPagination, USelect } from '#components'
import { useAppConfig } from '#imports'
import { computed } from 'vue'
import { tv } from '@nuxt/ui/utils/tv'
import theme from '#build/movk-ui/data-table-pagination'
import type { DataTablePaginationProps, DataTablePaginationSlots, DataTablePaginationUi } from '../../../types/data-table/pagination'

type Pagination = ComponentConfig<typeof theme, AppConfig, 'dataTablePagination'>

const props = defineProps<DataTablePaginationProps<T> & {
  uiConfig?: DataTablePaginationUi & { ui?: Pagination['slots'] }
}>()

defineSlots<DataTablePaginationSlots<T>>()

const appConfig = useAppConfig() as { movk?: { dataTablePagination?: unknown } }
const uiCls = computed(() =>
  tv({ extend: tv(theme), ...((appConfig.movk?.dataTablePagination || {}) as typeof theme) })()
)

const cfg = computed(() => ({
  pageSizes: props.uiConfig?.pageSizes ?? [],
  showSelectedCount: props.uiConfig?.showSelectedCount ?? true,
  showRowRange: props.uiConfig?.showRowRange ?? true,
  paginationProps: props.uiConfig?.paginationProps,
  pageSizeSelectProps: props.uiConfig?.pageSizeSelectProps,
  ui: props.uiConfig?.ui
}))

interface PaginationUiText {
  total?: string
  item?: string
  range?: string
  selected?: string
  page?: string
}

const text = computed<Required<PaginationUiText>>(() => ({
  total: props.uiConfig?.text?.total ?? '共',
  item: props.uiConfig?.text?.item ?? '条',
  range: props.uiConfig?.text?.range ?? '显示',
  selected: props.uiConfig?.text?.selected ?? '已选',
  page: props.uiConfig?.text?.page ?? '页'
}))

const pageSizeOptions = computed(() =>
  cfg.value.pageSizes.map(size => ({
    label: `${size} ${text.value.item}/页`,
    value: size
  }))
)

const showPageSizeSelect = computed(() => cfg.value.pageSizes.length > 1)

const pageSizeSelectAttrs = computed(() => ({
  ...cfg.value.pageSizeSelectProps,
  class: uiCls.value.pageSizeSelect({ class: cfg.value.pageSizeSelectProps?.class })
}))

const paginationAttrs = computed(() => ({
  ...cfg.value.paginationProps,
  class: uiCls.value.pagination({ class: cfg.value.paginationProps?.class })
}))

const summaryText = computed(() => {
  if (!props.rowCountKnown) {
    if (props.from === 0) return `${text.value.range} 0`
    return `${text.value.range} ${props.from}-${props.to}，第 ${props.page} / ${props.pageCount} ${text.value.page}`
  }
  if (!cfg.value.showRowRange || props.rowCount === 0) {
    return `${text.value.total} ${props.rowCount} ${text.value.item}`
  }
  return `${text.value.range} ${props.from}-${props.to}，${text.value.total} ${props.rowCount} ${text.value.item}`
})

const selectedText = computed(() =>
  `${text.value.selected} ${props.selectedCount} ${text.value.item}`
)

const summarySlotProps = computed(() => ({
  summaryText: summaryText.value,
  selectedText: selectedText.value,
  selectedCount: props.selectedCount,
  rowCount: props.rowCount,
  rowCountKnown: props.rowCountKnown,
  from: props.from,
  to: props.to,
  page: props.page,
  pageCount: props.pageCount,
  showSelectedCount: cfg.value.showSelectedCount
}))

const actionsSlotProps = computed(() => ({
  tableApi: props.tableApi,
  page: props.page,
  pageCount: props.pageCount,
  pageSize: props.pagination.pageSize,
  rowCount: props.rowCount,
  pageSizes: cfg.value.pageSizes,
  pageSizeOptions: pageSizeOptions.value,
  showPageSizeSelect: showPageSizeSelect.value,
  setPage: props.setPage,
  setPageSize: props.setPageSize
}))

const setPage = (value: number) => props.setPage(value)
const setPageSize = (value: unknown) => props.setPageSize(value)
</script>

<template>
  <div :class="uiCls.root({ class: cfg.ui?.root })" data-slot="root">
    <div :class="uiCls.summary({ class: cfg.ui?.summary })" data-slot="summary">
      <slot name="summary" v-bind="summarySlotProps">
        <span :class="uiCls.summaryText({ class: cfg.ui?.summaryText })">{{ summaryText }}</span>
        <span
          v-if="cfg.showSelectedCount && selectedCount > 0"
          :class="uiCls.selectedCount({ class: cfg.ui?.selectedCount })"
        >
          {{ selectedText }}
        </span>
      </slot>
    </div>

    <div :class="uiCls.actions({ class: cfg.ui?.actions })" data-slot="actions">
      <slot name="actions" v-bind="actionsSlotProps">
        <USelect
          v-if="showPageSizeSelect"
          :model-value="pagination.pageSize"
          :items="pageSizeOptions"
          v-bind="pageSizeSelectAttrs"
          @update:model-value="setPageSize"
        />

        <UPagination
          :page="page"
          :total="pageCount * pagination.pageSize"
          :items-per-page="pagination.pageSize"
          v-bind="paginationAttrs"
          data-slot="pagination"
          @update:page="setPage"
        />
      </slot>
    </div>
  </div>
</template>
