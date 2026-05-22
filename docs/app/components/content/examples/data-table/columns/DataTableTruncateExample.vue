<script setup lang="ts">
import type { DataTableColumn } from '@movk/nuxt'
import type { Person } from '~/composables/useTableMock'

const data = makePeople(8)

const columns: DataTableColumn<Person>[] = [
  { accessorKey: 'name', header: '姓名', size: 100 },
  { accessorKey: 'bio', header: '个人简介', size: 240, tooltip: 2 },
  { accessorKey: 'address', header: '地址', size: 200, truncate: true },
  { accessorKey: 'department', header: '部门', size: 100, truncate: false }
]
</script>

<template>
  <MDataTable :columns="columns" :data="data" bordered :ui="{ root: 'max-w-3xl' }" />
</template>
