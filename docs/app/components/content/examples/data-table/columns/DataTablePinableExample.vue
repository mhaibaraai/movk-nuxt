<script setup lang="ts">
import type { DataTableColumn, DataTableDataColumn } from '@movk/nuxt'
import type { Person } from '~/composables/useTableMock'

const data = makePeople(8)
const moneyCell: DataTableDataColumn<Person>['cell'] = ({ getValue }) => `¥${getValue<number>().toLocaleString()}`

const columns: DataTableColumn<Person>[] = [
  { accessorKey: 'id', header: '工号', fixed: 'left', size: 100, pinable: false },
  { accessorKey: 'name', header: '姓名', size: 120 },
  { accessorKey: 'department', header: '部门', size: 100 },
  { accessorKey: 'role', header: '岗位', size: 140 },
  { accessorKey: 'salary', header: '薪资', align: 'right', size: 120, cell: moneyCell }
]
</script>

<template>
  <MDataTable :columns="columns" :data="data" pinable bordered :ui="{ root: 'max-w-3xl' }" />
</template>
