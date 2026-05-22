<script setup lang="ts">
import type { DataTableColumn, RowSelectionState } from '@movk/nuxt'
import type { Person } from '~/composables/useTableMock'

const data = makePeople(6)
const selection = ref<RowSelectionState>({})

const columns: DataTableColumn<Person>[] = [
  { type: 'selection', mode: 'single', header: '选择' },
  { accessorKey: 'name', header: '姓名', size: 110 },
  { accessorKey: 'department', header: '部门', size: 90 },
  { accessorKey: 'role', header: '岗位', size: 120 }
]
</script>

<template>
  <MDataTable
    v-model:row-selection="selection"
    row-key="id"
    :columns="columns"
    :data="data"
    bordered
  />
</template>
