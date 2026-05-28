<script setup lang="ts">
import type { DataTableColumn, DataTableProps } from '@movk/nuxt'
import type { Person } from '~/composables/useTableMock'

const data = makePeople(6)
const columns: DataTableColumn<Person>[] = [
  { accessorKey: 'name', header: '姓名' },
  { accessorKey: 'department', header: '部门', size: 90 },
  { accessorKey: 'role', header: '岗位', size: 130 },
  { accessorKey: 'level', header: '职级', size: 90 }
]

const customUi: DataTableProps<Person>['ui'] = {
  root: 'rounded-xl shadow-sm',
  th: 'bg-primary/10 text-primary font-semibold',
  td: 'py-3 text-default',
  tbody: 'divide-y divide-default'
}
</script>

<template>
  <MDataTable :data="data" :columns="columns" :ui="customUi" />
</template>
