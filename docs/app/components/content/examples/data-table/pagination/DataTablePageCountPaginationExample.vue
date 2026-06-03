<script setup lang="ts">
import type { DataTableColumn, PaginationState } from '@movk/nuxt'
import type { Person } from '~/composables/useTableMock'

// 服务端只返回页数（pageCount），不返回总条数
const all = makePeople(80)
const pagination = ref<PaginationState>({ pageIndex: 0, pageSize: 5 })
const pageCount = computed(() => Math.ceil(all.length / pagination.value.pageSize))
const pageData = computed(() => {
  const start = pagination.value.pageIndex * pagination.value.pageSize
  return all.slice(start, start + pagination.value.pageSize)
})
const columns: DataTableColumn<Person>[] = [
  { accessorKey: 'id', header: '工号' },
  { accessorKey: 'name', header: '姓名' },
  { accessorKey: 'department', header: '部门' },
  { accessorKey: 'role', header: '岗位' }
]
</script>

<template>
  <MDataTable
    v-model:pagination="pagination"
    :data="pageData"
    :columns="columns"
    :pagination-options="{ manualPagination: true, pageCount }"
    :ui="{ root: 'max-h-[60vh]' }"
  />
</template>
