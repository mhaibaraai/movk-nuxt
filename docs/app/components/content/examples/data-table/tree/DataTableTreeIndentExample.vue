<script setup lang="ts">
import type { DataTableColumn } from '@movk/nuxt'
import type { Person } from '~/composables/useTableMock'

const treeData = makePeopleTree(3, 3, 3)

const columns: DataTableColumn<Person>[] = [
  { type: 'expand' },
  { accessorKey: 'name', header: '成员' },
  { accessorKey: 'department', header: '部门' },
  { accessorKey: 'role', header: '岗位' }
]
</script>

<template>
  <MDataTable :default-expanded="1" :data="treeData" :columns="columns" children-key="children" row-key="id" />
</template>
