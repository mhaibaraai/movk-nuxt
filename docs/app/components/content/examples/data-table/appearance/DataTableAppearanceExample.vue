<script setup lang="ts">
import type { DataTableColumn, DataTableProps } from '@movk/nuxt'
import type { Person } from '~/composables/useTableMock'

const props = defineProps<{
  stripe?: DataTableProps<Person>['stripe']
  bordered?: DataTableProps<Person>['bordered']
  density?: DataTableProps<Person>['density']
  fitContent?: DataTableProps<Person>['fitContent']
  sticky?: DataTableProps<Person>['sticky']
}>()

const data = makePeople(20)
const columns: DataTableColumn<Person>[] = [
  { accessorKey: 'id', header: '工号' },
  { accessorKey: 'name', header: '姓名' },
  { accessorKey: 'department', header: '部门' },
  { accessorKey: 'role', header: '岗位' },
  { accessorKey: 'level', header: '职级' }
]
</script>

<template>
  <MDataTable v-bind="props" :data="data" :columns="columns" :ui="{ root: 'max-h-80' }" />
</template>
