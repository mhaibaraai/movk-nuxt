<script setup lang="ts">
import type { DataTableColumn } from '@movk/nuxt'
import type { Person } from '~/composables/useTableMock'

const treeData = makePeopleTree(3, 3, 2)

const columns: DataTableColumn<Person>[] = [
  { type: 'expand' },
  { accessorKey: 'name', header: '成员', size: 200 },
  { accessorKey: 'department', header: '部门' },
  { accessorKey: 'role', header: '岗位' },
  { accessorKey: 'level', header: '职级', emptyCell: '—' }
]
</script>

<template>
  <MDataTable
    :data="treeData"
    :columns="columns"
    children-key="children"
    row-key="id"
    bordered
    :ui="{ root: 'max-h-[50vh]' }"
  />
</template>
