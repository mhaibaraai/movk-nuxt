<script setup lang="ts">
import type { DataTableColumn, RowSelectionState } from '@movk/nuxt'
import type { Person } from '~/composables/useTableMock'

const treeData = makePeopleTree(3, 3)
const selection = ref<RowSelectionState>({
  P0101: true,
  P0102: true,
  P0201: true,
  P0202: true,
  P0203: true
})

const columns: DataTableColumn<Person>[] = [
  {
    type: 'selection',
    strategy: 'leaf',
    checkboxProps: (ctx) => {
      if (ctx.scope === 'header') return { color: 'success' }
      if (ctx.isLeafAggregate) return { color: 'neutral' }
      return {
        disabled: ctx.cellContext.row.original.status === 'offboarded',
        color: 'primary'
      }
    }
  },
  { type: 'expand' },
  { accessorKey: 'name', header: '姓名' },
  { accessorKey: 'status', header: '状态' }
]
</script>

<template>
  <MDataTable
    v-model:row-selection="selection"
    row-key="id"
    children-key="children"
    :columns="columns"
    :data="treeData"
  />
</template>
