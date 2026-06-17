<script setup lang="ts">
import type { DataTableColumn } from '@movk/nuxt'
import type { Person } from '~/composables/useTableMock'

const data = makePeople(8)

const columns: DataTableColumn<Person>[] = [
  { accessorKey: 'id', header: '工号' },
  { accessorKey: 'name', header: '姓名', minSize: 80 },
  { accessorKey: 'level', header: '职级', resizable: false },
  { accessorKey: 'address', header: '地址', size: 120 },
  { accessorKey: 'bio', header: '个人简介', size: 150, resizable: true }
]
</script>

<template>
  <MDataTable :columns="columns" :data="data" :ui="{ root: 'max-w-3xl' }" />
</template>
