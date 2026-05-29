<script setup lang="ts">
import type { DataTableColumn, PaginationState } from '@movk/nuxt'
import type { Person } from '~/composables/useTableMock'

const data = makePeople(80)
const pagination = ref<PaginationState>({ pageIndex: 0, pageSize: 5 })
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
    :data="data"
    :columns="columns"
    bordered
    :pagination-ui="{
      pageSizes: [5, 10, 20],
      paginationProps: { showEdges: true, siblingCount: 1, color: 'success' },
      pageSizeSelectProps: { size: 'sm', variant: 'subtle' }
    }"
    :ui="{ root: 'max-h-[60vh]' }"
  />
</template>
