<script setup lang="ts">
import type { DataTableColumn, PaginationState, RowSelectionState } from '@movk/nuxt'
import type { Person } from '~/composables/useTableMock'

const data = makePeople(8)
const selection = ref<RowSelectionState>({ P0002: true })
const pagination = ref<PaginationState>({ pageIndex: 0, pageSize: 4 })
const columns: DataTableColumn<Person>[] = [
  { type: 'selection', mode: 'multiple' },
  { accessorKey: 'name', header: '姓名' },
  { accessorKey: 'department', header: '部门', size: 90 },
  { accessorKey: 'role', header: '岗位', size: 130 }
]
</script>

<template>
  <MDataTable
    v-model:row-selection="selection"
    v-model:pagination="pagination"
    :data="data"
    :columns="columns"
    row-key="id"
    :pagination-ui="{
      show: true,
      pageSizes: [4, 8],
      ui: {
        root: 'border-t border-default pt-3 mt-1',
        summary: 'text-primary font-medium',
        actions: 'gap-4',
        selectedCount: 'text-success'
      }
    }"
  />
</template>
