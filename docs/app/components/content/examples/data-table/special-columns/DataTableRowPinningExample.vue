<script setup lang="ts">
import type { DataTableColumn, RowPinningState } from '@movk/nuxt'
import type { Person } from '~/composables/useTableMock'

const data = makePeople(8)
const pinning = ref<RowPinningState>({ top: ['P0001'], bottom: ['P0004', 'P0008'] })

const columns: DataTableColumn<Person>[] = [
  { type: 'row-pinning', position: 'top', header: '顶' },
  { accessorKey: 'id', header: 'ID' },
  { accessorKey: 'name', header: '姓名' },
  { accessorKey: 'department', header: '部门' },
  { accessorKey: 'role', header: '岗位' }
]
</script>

<template>
  <MDataTable v-model:row-pinning="pinning" row-key="id" :columns="columns" :data="data" :ui="{ root: 'max-h-65' }" />
</template>
