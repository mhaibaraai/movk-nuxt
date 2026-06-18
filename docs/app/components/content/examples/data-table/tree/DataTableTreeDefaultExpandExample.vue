<script setup lang="ts">
import type { DataTableColumn, DataTableProps } from '@movk/nuxt'
import type { Person } from '~/composables/useTableMock'

const props = withDefaults(defineProps<{
  mode?: 'all' | 'depth1' | 'depth2' | 'fn'
}>(), { mode: 'all' })

const treeData = makePeopleTree(3, 3, 3)

const columns: DataTableColumn<Person>[] = [
  { type: 'expand' },
  { accessorKey: 'name', header: '成员' },
  { accessorKey: 'department', header: '部门' },
  { accessorKey: 'role', header: '岗位' }
]

const defaultExpanded = computed<DataTableProps<Person>['defaultExpanded']>(() => {
  if (props.mode === 'depth1') return 1
  if (props.mode === 'depth2') return 2
  if (props.mode === 'fn') return row => row.department === '设计'
  return true
})
</script>

<template>
  <MDataTable
    :key="props.mode"
    :default-expanded="defaultExpanded"
    :data="treeData"
    :columns="columns"
    children-key="children"
    row-key="id"
    class="max-h-150"
  />
</template>
