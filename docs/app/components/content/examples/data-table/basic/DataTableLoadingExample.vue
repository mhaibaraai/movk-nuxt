<script setup lang="ts">
import type { DataTableColumn } from '@movk/nuxt'
import type { Person } from '~/composables/useTableMock'

const columns: DataTableColumn<Person>[] = [
  { accessorKey: 'id', header: '工号' },
  { accessorKey: 'name', header: '姓名' },
  { accessorKey: 'department', header: '部门' },
  { accessorKey: 'role', header: '岗位' }
]
</script>

<template>
  <MDataTable :columns="columns" :data="[]" loading />
</template>
