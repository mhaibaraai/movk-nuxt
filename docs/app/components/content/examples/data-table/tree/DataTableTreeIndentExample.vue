<script setup lang="ts">
import type { DataTableColumn, DataTableProps } from '@movk/nuxt'
import type { Person } from '~/composables/useTableMock'

const props = withDefaults(defineProps<{
  indentSize?: '0.5rem' | '1rem' | '36' | '2.5rem' | 'dynamic'
}>(), { indentSize: '1rem' })

const dynamicIndent: DataTableProps<Person>['indentSize'] = ctx => `${(ctx.row.depth + 1) * 1.25}rem`
const indentSize = computed(() => props.indentSize === 'dynamic'
  ? dynamicIndent
  : props.indentSize === '36' ? Number(props.indentSize) : props.indentSize)

const treeData = makePeopleTree(3, 3, 3)

const columns: DataTableColumn<Person>[] = [
  { type: 'expand' },
  { accessorKey: 'name', header: '成员' },
  { accessorKey: 'department', header: '部门' },
  { accessorKey: 'role', header: '岗位' }
]
</script>

<template>
  <MDataTable
    :indent-size="indentSize"
    :default-expanded="1"
    :data="treeData"
    :columns="columns"
    children-key="children"
    row-key="id"
  />
</template>
