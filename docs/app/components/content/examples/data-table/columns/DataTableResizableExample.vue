<script setup lang="ts">
import type { DataTableColumn } from '@movk/nuxt'
import type { Person } from '~/composables/useTableMock'

const data = makePeople(8)

const columns: DataTableColumn<Person>[] = [
  { accessorKey: 'id', header: '工号', size: 100 },
  { accessorKey: 'name', header: '姓名', size: 120 },
  { accessorKey: 'level', header: '职级', size: 100, resizable: false },
  { accessorKey: 'address', header: '地址', size: 180 },
  { accessorKey: 'bio', header: '个人简介', size: 200, resizable: true }
]
</script>

<template>
  <MDataTable :columns="columns" :data="data" />
</template>
