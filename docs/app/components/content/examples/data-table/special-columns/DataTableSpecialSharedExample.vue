<script setup lang="ts">
import type { DataTableAction, DataTableColumn } from '@movk/nuxt'
import type { Person } from '~/composables/useTableMock'

const data = makePeople(5)
const toast = useToast()
const actions: DataTableAction<Person>[] = [
  { key: 'view', buttonProps: { icon: 'i-lucide-eye', variant: 'ghost', size: 'xs' }, onClick: ({ row }) => { toast.add({ title: `查看 ${row.name}`, duration: 1500 }) } }
]

const columns: DataTableColumn<Person>[] = [
  { type: 'selection', pinable: true, resizable: true },
  { type: 'index', visibility: false },
  { type: 'row-pinning', pinable: false },
  { accessorKey: 'name', header: '姓名' },
  { accessorKey: 'department', header: '部门', size: 90 },
  { type: 'actions', resizable: true, size: 80, actions }
]
</script>

<template>
  <MDataTable row-key="id" :columns="columns" :data="data" />
</template>
