<script setup lang="ts">
import type { DataTableColumn } from '@movk/nuxt'
import type { Person } from '~/composables/useTableMock'

const columns: DataTableColumn<Person>[] = [
  { accessorKey: 'name', header: '姓名' },
  { accessorKey: 'department', header: '部门', size: 90 },
  { accessorKey: 'role', header: '岗位', size: 130 },
  { accessorKey: 'level', header: '职级', size: 90 }
]
</script>

<template>
  <MDataTable :data="makePeople(30)" :columns="columns" :ui="{ root: 'max-h-[40vh]' }" />
</template>
