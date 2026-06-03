<script setup lang="ts">
import type { DataTableColumn } from '@movk/nuxt'
import type { Person } from '~/composables/useTableMock'

const data = makePeople(8)

const columns: DataTableColumn<Person>[] = [
  { accessorKey: 'name', header: '姓名' },
  { accessorKey: 'bio', header: '个人简介', size: 240, tooltip: 1 },
  { accessorKey: 'role', header: '角色', size: 60 },
  { accessorKey: 'address', header: '地址', size: 200, truncate: true }
]
</script>

<template>
  <MDataTable :columns="columns" :data="data" :ui="{ root: 'max-w-3xl' }" />
</template>
