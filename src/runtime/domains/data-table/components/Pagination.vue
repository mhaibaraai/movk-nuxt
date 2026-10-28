<script lang="ts" setup generic="T extends TableData">
import type { TableData } from '@nuxt/ui'
import { UPagination, USelect } from '#components'
import { useAppConfig } from '#imports'
import { computed } from 'vue'
import { useExtendedTv } from '../../../utils/extend-theme'
import { useMovkLocale } from '../../../composables/useMovkLocale'
import { interpolate } from '../../../utils/interpolate'
import theme from '#build/movk-ui/data-table-pagination'
import type { MovkMessages } from '../../../types/locale'
import type { DataTablePaginationProps, DataTablePaginationSlots } from '../../../types/data-table/pagination'

const props = defineProps<DataTablePaginationProps<T>>()

defineSlots<DataTablePaginationSlots<T>>()

const appConfig = useAppConfig() as { movk?: { dataTablePagination?: unknown } }
const { t } = useMovkLocale()

const cfg = computed(() => ({
  pageSizes: props.uiConfig?.pageSizes ?? [],
  showSelectedCount: props.uiConfig?.showSelectedCount ?? true,
  showRowRange: props.uiConfig?.showRowRange ?? true,
  paginationProps: props.uiConfig?.paginationProps,
  pageSizeSelectProps: props.uiConfig?.pageSizeSelectProps
}))

const { extendUi: ui } = useExtendedTv(
  { slots: {} },
  theme,
  () => appConfig.movk?.dataTablePagination,
  () => ({
    ui: {
      ...props.uiConfig?.ui,
      pageSizeSelect: [props.uiConfig?.ui?.pageSizeSelect, cfg.value.pageSizeSelectProps?.class],
      pagination: [props.uiConfig?.ui?.pagination, cfg.value.paginationProps?.class]
    }
  })
)

function format(key: keyof MovkMessages['pagination'], vars: Record<string, number>): string {
  const custom = props.uiConfig?.text?.[key]
  return custom ? interpolate(custom, vars) : t(`pagination.${key}`, vars)
}

const pageSizeOptions = computed(() =>
  cfg.value.pageSizes.map(size => ({
    label: format('pageSize', { size }),
    value: size
  }))
)

const showPageSizeSelect = computed(() => cfg.value.pageSizes.length > 1)

const pageSizeSelectAttrs = computed(() => ({ ...cfg.value.pageSizeSelectProps, class: ui.value.pageSizeSelect }))
const paginationAttrs = computed(() => ({ ...cfg.value.paginationProps, class: ui.value.pagination }))

const summaryText = computed(() => {
  const { from, to, page, pageCount, rowCount } = props
  if (!props.rowCountKnown) {
    return from === 0 ? format('empty', {}) : format('rangeUnknown', { from, to, page, pageCount })
  }
  if (!cfg.value.showRowRange || rowCount === 0) return format('total', { total: rowCount })
  return format('range', { from, to, total: rowCount })
})

const selectedText = computed(() => format('selected', { count: props.selectedCount }))

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
  <div :class="ui.root" data-slot="root">
    <div :class="ui.summary" data-slot="summary">
      <slot name="summary" v-bind="summarySlotProps">
        <span :class="ui.summaryText">{{ summaryText }}</span>
        <span
          v-if="cfg.showSelectedCount && selectedCount > 0"
          :class="ui.selectedCount"
        >
          {{ selectedText }}
        </span>
      </slot>
    </div>

    <div :class="ui.actions" data-slot="actions">
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
