<script setup lang="ts">
import type { DataTableColumn, DataTableDataColumn } from '@movk/nuxt'
import type { Person } from '~/composables/useTableMock'

const data = makePeople(8)
const moneyCell: DataTableDataColumn<Person>['cell'] = ({ getValue }) => `¥${getValue<number>().toLocaleString()}`

const columns: DataTableColumn<Person>[] = [
  { accessorKey: 'id', header: '工号', sortable: true },
  { accessorKey: 'name', header: '姓名' },
  { accessorKey: 'level', header: '职级', sortable: false },
  { accessorKey: 'address', header: '地址' },
  { accessorKey: 'salary', header: '薪资', align: 'right', cell: moneyCell }
]
</script>

<template>
  <MDataTable :columns="columns" :data="data" />
</template>
