<script setup lang="ts">
import type { DataTableColumn, DataTableDataColumn } from '@movk/nuxt'
import type { Person } from '~/composables/useTableMock'

const data = makePeople(8)
const moneyCell: DataTableDataColumn<Person>['cell'] = ({ getValue }) => `¥${getValue<number>().toLocaleString()}`

const columns: DataTableColumn<Person>[] = [
  { accessorKey: 'id', header: '工号', fixed: 'left', pinable: true },
  { accessorKey: 'name', header: '姓名' },
  { accessorKey: 'department', header: '部门', pinable: false },
  { accessorKey: 'role', header: '岗位' },
  { accessorKey: 'salary', header: '薪资', align: 'right', cell: moneyCell }
]
</script>

<template>
  <MDataTable :columns="columns" :data="data" :ui="{ root: 'max-w-3xl' }" />
</template>
