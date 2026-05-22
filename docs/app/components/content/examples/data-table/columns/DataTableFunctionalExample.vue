<script setup lang="ts">
import type { DataTableColumn, DataTableDataColumn, DataTableProps } from '@movk/nuxt'
import type { Person } from '~/composables/useTableMock'

const data = makePeople(8)
const moneyCell: DataTableDataColumn<Person>['cell'] = ({ getValue }) => `¥${getValue<number>().toLocaleString()}`

const columns: DataTableColumn<Person>[] = [
  { accessorKey: 'id', header: '工号', size: 100 },
  { accessorKey: 'name', header: '姓名', size: 120 },
  { accessorKey: 'department', header: '部门', size: 100 },
  { accessorKey: 'bio', header: '个人简介', size: 220 },
  { accessorKey: 'address', header: '地址', size: 180 },
  { accessorKey: 'salary', header: '薪资', align: 'right', size: 120, cell: moneyCell }
]

const sortableFn: DataTableProps<Person>['sortable'] = col => col.accessorKey !== 'id'
const pinableFn: DataTableProps<Person>['pinable'] = col => !['bio', 'address'].includes(col.accessorKey)
const resizableFn: DataTableProps<Person>['resizable'] = col => col.accessorKey !== 'salary'
const truncateFn: DataTableDataColumn<Person>['truncate'] = ctx =>
  ctx.column.id === 'bio' ? (ctx.row.original.bio.length > 45 ? 3 : 2) : true
const tooltipFn: DataTableDataColumn<Person>['tooltip'] = ctx => ctx.column.id === 'address'
</script>

<template>
  <MDataTable
    :columns="columns"
    :data="data"
    bordered
    :sortable="sortableFn"
    :pinable="pinableFn"
    :resizable="resizableFn"
    :truncate="truncateFn"
    :tooltip="tooltipFn"
  />
</template>
