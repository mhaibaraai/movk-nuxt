<script setup lang="ts">
import type { DataTableColumn, DataTableDataColumn, DataTableProps } from '@movk/nuxt'
import type { Person } from '~/composables/useTableMock'

const props = defineProps<{
  sortable?: DataTableProps<Person>['sortable']
  pinable?: DataTableProps<Person>['pinable']
  resizable?: DataTableProps<Person>['resizable']
  columnResizeMode?: DataTableProps<Person>['columnResizeMode']
}>()

const data = makePeople(8)
const moneyCell: DataTableDataColumn<Person>['cell'] = ({ getValue }) => `¥${getValue<number>().toLocaleString()}`

const columns: DataTableColumn<Person>[] = [
  { accessorKey: 'id', header: '工号', fixed: 'start', size: 100 },
  { accessorKey: 'name', header: '姓名', sortable: true },
  { accessorKey: 'department', header: '部门', pinable: false },
  { accessorKey: 'level', header: '职级', sortable: false, resizable: false },
  { accessorKey: 'address', header: '地址', minSize: 160 },
  { accessorKey: 'salary', header: '薪资', align: 'right', cell: moneyCell }
]
</script>

<template>
  <MDataTable v-bind="props" :columns="columns" :data="data" :ui="{ root: 'max-w-3xl' }" />
</template>
