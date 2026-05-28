<script setup lang="ts">
import type { DataTableColumn, DataTableDataColumn } from '@movk/nuxt'
import type { Person } from '~/composables/useTableMock'

const data = makePeople(6)
const moneyCell: DataTableDataColumn<Person>['cell'] = ({ getValue }) => `¥${getValue<number>().toLocaleString()}`
const columns: DataTableColumn<Person>[] = [
  { accessorKey: 'id', header: '工号' },
  { accessorKey: 'name', header: '姓名' },
  { accessorKey: 'department', header: '部门' },
  { accessorKey: 'role', header: '岗位' },
  { accessorKey: 'level', header: '职级' },
  { accessorKey: 'email', header: '邮箱' },
  { accessorKey: 'joinedAt', header: '入职日期', visibility: false },
  { accessorKey: 'salary', header: '薪资', align: 'right', cell: moneyCell }
]
</script>

<template>
  <MDataTable :columns="columns" :data="data" />
</template>
