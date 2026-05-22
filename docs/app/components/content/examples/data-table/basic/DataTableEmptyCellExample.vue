<script setup lang="ts">
import type { DataTableColumn } from '@movk/nuxt'
import type { Person } from '~/composables/useTableMock'

const data = makePeople(4).map((p, i) => (i % 2 ? { ...p, role: '' } : p))

const columns: DataTableColumn<Person>[] = [
  { accessorKey: 'id', header: '工号', size: 100 },
  { accessorKey: 'name', header: '姓名', size: 120 },
  { accessorKey: 'role', header: '岗位', size: 160, emptyCell: '暂无' }
]
</script>

<template>
  <MDataTable :columns="columns" :data="data" row-key="id" empty-cell="—" />
</template>
