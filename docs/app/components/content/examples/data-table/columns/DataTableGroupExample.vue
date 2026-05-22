<script setup lang="ts">
import type { DataTableColumn, DataTableDataColumn } from '@movk/nuxt'
import type { Person } from '~/composables/useTableMock'

const data = makePeople(6)
const moneyCell: DataTableDataColumn<Person>['cell'] = ({ getValue }) => `¥${getValue<number>().toLocaleString()}`

const columns: DataTableColumn<Person>[] = [
  { accessorKey: 'id', header: '工号', size: 100 },
  {
    header: '员工信息',
    children: [
      { accessorKey: 'name', header: '姓名', size: 120 },
      { accessorKey: 'department', header: '部门', size: 100 },
      { accessorKey: 'role', header: '岗位', size: 140 }
    ]
  },
  {
    header: '薪酬',
    children: [
      { accessorKey: 'level', header: '职级', size: 100 },
      { accessorKey: 'salary', header: '薪资', align: 'right', size: 120, cell: moneyCell }
    ]
  }
]
</script>

<template>
  <MDataTable :columns="columns" :data="data" bordered />
</template>
