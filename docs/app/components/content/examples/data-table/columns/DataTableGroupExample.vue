<script setup lang="ts">
import type { DataTableColumn, DataTableDataColumn } from '@movk/nuxt'
import type { Person } from '~/composables/useTableMock'

const data = makePeople(6)
const moneyCell: DataTableDataColumn<Person>['cell'] = ({ getValue }) => `¥${getValue<number>().toLocaleString()}`

const columns: DataTableColumn<Person>[] = [
  { accessorKey: 'id', header: '工号' },
  {
    header: '员工信息',
    children: [
      { accessorKey: 'name', header: '姓名' },
      { accessorKey: 'department', header: '部门' },
      { accessorKey: 'role', header: '岗位' }
    ]
  },
  {
    header: '薪酬',
    children: [
      { accessorKey: 'level', header: '职级' },
      { accessorKey: 'salary', header: '薪资', align: 'right', cell: moneyCell }
    ]
  }
]
</script>

<template>
  <MDataTable :columns="columns" :data="data" bordered />
</template>
