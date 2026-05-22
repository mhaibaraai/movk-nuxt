<script setup lang="ts">
import type { DataTableColumn, PaginationState } from '@movk/nuxt'
import type { Person } from '~/composables/useTableMock'

// 用本地切片模拟服务端：仅持有当前页数据 + 已知总条数 rowCount
const all = makePeople(80)
const pagination = ref<PaginationState>({ pageIndex: 0, pageSize: 5 })
const rowCount = all.length
const pageData = computed(() => {
  const start = pagination.value.pageIndex * pagination.value.pageSize
  return all.slice(start, start + pagination.value.pageSize)
})
const columns: DataTableColumn<Person>[] = [
  { accessorKey: 'id', header: '工号', size: 90 },
  { accessorKey: 'name', header: '姓名', size: 110 },
  { accessorKey: 'department', header: '部门', size: 90 },
  { accessorKey: 'role', header: '岗位', size: 130 }
]
</script>

<template>
  <MDataTable
    v-model:pagination="pagination"
    :data="pageData"
    :columns="columns"
    bordered
    :pagination-options="{ manualPagination: true, rowCount }"
    :ui="{ root: 'max-h-[60vh]' }"
  />
</template>
