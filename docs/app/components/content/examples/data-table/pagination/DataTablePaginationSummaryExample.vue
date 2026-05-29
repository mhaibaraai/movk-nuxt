<script setup lang="ts">
import type { DataTableColumn, PaginationState, RowSelectionState } from '@movk/nuxt'
import type { Person } from '~/composables/useTableMock'

const data = makePeople(40)
const pagination = ref<PaginationState>({ pageIndex: 0, pageSize: 10 })
const selection = ref<RowSelectionState>({})
const columns: DataTableColumn<Person>[] = [
  { accessorKey: 'id', header: '工号', size: 90 },
  { accessorKey: 'name', header: '姓名' },
  { accessorKey: 'department', header: '部门' },
  { accessorKey: 'role', header: '岗位' }
]
</script>

<template>
  <MDataTable
    v-model:pagination="pagination"
    v-model:row-selection="selection"
    :data="data"
    :columns="columns"
    row-key="id"
    select-on-row-click
    bordered
    :pagination-ui="{
      showSelectedCount: true,
      showRowRange: true,
      text: { total: '总计', item: '人', range: '当前', selected: '勾选' }
    }"
    :ui="{ root: 'max-h-[60vh]' }"
  />
</template>
