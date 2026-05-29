<script setup lang="ts">
import type { DataTableColumn, PaginationState } from '@movk/nuxt'
import type { Person } from '~/composables/useTableMock'

const data = makePeople(80)
const pagination = ref<PaginationState>({ pageIndex: 0, pageSize: 5 })

const columns: DataTableColumn<Person>[] = [
  { type: 'index', header: '序' },
  { accessorKey: 'name', header: '姓名', sortable: true },
  { accessorKey: 'department', header: '部门' },
  { accessorKey: 'salary', header: '薪资', align: 'right', sortable: true }
]
</script>

<template>
  <MDataTable v-model:pagination="pagination" row-key="id" :columns="columns" :data="data" sortable />
</template>
