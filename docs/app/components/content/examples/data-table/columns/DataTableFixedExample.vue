<script setup lang="ts">
import type { DataTableColumn, DataTableDataColumn } from '@movk/nuxt'
import type { Person } from '~/composables/useTableMock'

const data = makePeople(8)
const moneyCell: DataTableDataColumn<Person>['cell'] = ({ getValue }) => `¥${getValue<number>().toLocaleString()}`

const columns: DataTableColumn<Person>[] = [
  { accessorKey: 'id', header: '工号', fixed: 'left', size: 100 },
  { accessorKey: 'name', header: '姓名', fixed: 'left', size: 120 },
  { accessorKey: 'role', header: '岗位', size: 140 },
  { accessorKey: 'address', header: '地址', size: 240 },
  { accessorKey: 'email', header: '邮箱', size: 200 },
  { accessorKey: 'salary', header: '薪资', fixed: 'right', align: 'right', size: 120, cell: moneyCell }
]
</script>

<template>
  <MDataTable :columns="columns" :data="data" :ui="{ root: 'max-w-2xl' }" />
</template>
