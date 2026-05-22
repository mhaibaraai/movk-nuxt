<script setup lang="ts">
import type { DataTableColumn } from '@movk/nuxt'
import type { Person } from '~/composables/useTableMock'

const data = makePeople(8)
const toast = useToast()
const notify = (msg: string): void => { toast.add({ title: msg, duration: 1500 }) }

const columns: DataTableColumn<Person>[] = [
  { accessorKey: 'name', header: '姓名', size: 110 },
  { accessorKey: 'status', header: '状态', size: 90 },
  {
    type: 'actions',
    maxInline: 3,
    size: 120,
    actions: [
      { key: 'view', buttonProps: { icon: 'i-lucide-eye', variant: 'ghost', size: 'xs' }, onClick: ({ row }) => notify(`查看 ${row.name}`) },
      { key: 'edit', buttonProps: { icon: 'i-lucide-pencil', variant: 'ghost', size: 'xs' }, disabled: ({ row }) => row.status !== 'active', onClick: ({ row }) => notify(`编辑 ${row.name}`) },
      { key: 'recall', buttonProps: { icon: 'i-lucide-undo-2', label: '召回', size: 'xs' }, visibility: ({ row }) => row.status === 'offboarded', onClick: ({ row }) => notify(`召回 ${row.name}`) }
    ]
  }
]
</script>

<template>
  <MDataTable row-key="id" :columns="columns" :data="data" bordered />
</template>
