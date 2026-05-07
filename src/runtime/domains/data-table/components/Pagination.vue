<script lang="ts" setup generic="T extends TableData">
import type { ComponentConfig, TableData } from '@nuxt/ui'
import type { AppConfig } from 'nuxt/schema'
import { UPagination, USelect } from '#components'
import { useAppConfig } from '#imports'
import { computed } from 'vue'
import { tv } from '@nuxt/ui/utils/tv'
import theme from '#build/movk-ui/data-table-pagination'
import type { DataTablePaginationProps, DataTablePaginationSlots, DataTablePaginationUi } from '../../../types/data-table/pagination'

interface Props extends DataTablePaginationProps<T> {
  uiConfig?: DataTablePaginationUi & { ui?: ComponentConfig<typeof theme, AppConfig, 'dataTablePagination'>['slots'] }
}

const props = defineProps<Props>()

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
}

const text = computed<Required<PaginationUiText>>(() => ({
  total: props.uiConfig?.text?.total ?? '共',
  item: props.uiConfig?.text?.item ?? '条',
  range: props.uiConfig?.text?.range ?? '显示',
  selected: props.uiConfig?.text?.selected ?? '已选'
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
  setPage,
  setPageSize
}))

function setPage(value: number) {
  const nextPage = Math.floor(Number(value))
  if (!Number.isFinite(nextPage) || nextPage < 1) return
  const maxPage = Math.max(1, props.pageCount)
  props.tableApi.setPageIndex(Math.min(maxPage, nextPage) - 1)
}

function setPageSize(value: unknown) {
  if (value === '' || value == null) return
  const pageSize = Math.floor(Number(value))
  if (!Number.isFinite(pageSize) || pageSize <= 0) return
  props.tableApi.setPageSize(pageSize)
}
</script>

<template>
  <div :class="uiCls.root({ class: cfg.ui?.root })">
    <div :class="uiCls.summary({ class: cfg.ui?.summary })">
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

    <div :class="uiCls.actions({ class: cfg.ui?.actions })">
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
          :total="rowCount"
          :items-per-page="pagination.pageSize"
          v-bind="paginationAttrs"
          @update:page="setPage"
        />
      </slot>
    </div>
  </div>
</template>
