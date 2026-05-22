<script setup lang="ts">
import type { DataTableColumn, DataTableDataColumn } from '@movk/nuxt'
import type { Person } from '~/composables/useTableMock'

const data = makePeople(8)
const moneyCell: DataTableDataColumn<Person>['cell'] = ({ getValue }) => `¥${getValue<number>().toLocaleString()}`

const columns: DataTableColumn<Person>[] = [
  { accessorKey: 'id', header: '工号', size: 100, sortable: false },
  { accessorKey: 'name', header: '姓名', size: 120 },
  { accessorKey: 'level', header: '职级', size: 100 },
  { accessorKey: 'salary', header: '薪资', align: 'right', size: 120, cell: moneyCell }
]
</script>

<template>
  <MDataTable :columns="columns" :data="data" sortable bordered />
</template>
