<script setup lang="ts">
import type { DataTableColumn, RowPinningState } from '@movk/nuxt'
import type { Person } from '~/composables/useTableMock'

const data = makePeople(8)
const pinning = ref<RowPinningState>({ top: [], bottom: [] })

const columns: DataTableColumn<Person>[] = [
  { type: 'row-pinning', position: 'top', header: '顶' },
  { accessorKey: 'name', header: '姓名', size: 110 },
  { accessorKey: 'department', header: '部门', size: 90 },
  { accessorKey: 'role', header: '岗位', size: 120 }
]
</script>

<template>
  <MDataTable
    v-model:row-pinning="pinning"
    row-key="id"
    :columns="columns"
    :data="data"
    bordered
    :ui="{ root: 'max-h-65' }"
  />
</template>
