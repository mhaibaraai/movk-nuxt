<script setup lang="ts">
import type { DataTableColumn } from '@movk/nuxt'
import type { Person } from '~/composables/useTableMock'

const data = makePeople(6)

const columns: DataTableColumn<Person>[] = [
  { type: 'index', header: '序' },
  { accessorKey: 'name', header: '姓名', sortable: true, size: 110 },
  { accessorKey: 'department', header: '部门', size: 90 },
  { accessorKey: 'salary', header: '薪资', align: 'right', sortable: true, size: 100 }
]
</script>

<template>
  <MDataTable row-key="id" :columns="columns" :data="data" sortable bordered />
</template>
