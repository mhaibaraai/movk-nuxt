<script setup lang="ts">
import type { DataTableColumn } from '@movk/nuxt'
import type { Person } from '~/composables/useTableMock'

const data = makePeople(5)
const toast = useToast()
const notify = (msg: string): void => { toast.add({ title: msg, duration: 1500 }) }

const columns: DataTableColumn<Person>[] = [
  { accessorKey: 'name', header: '姓名' },
  { accessorKey: 'department', header: '部门' },
  {
    type: 'actions',
    minSize: 80,
    maxInline: 2,
    actions: [
      { key: 'view', buttonProps: { icon: 'i-lucide-eye', variant: 'ghost', size: 'xs' }, onClick: ({ row }) => notify(`查看 ${row.name}`) },
      { key: 'edit', buttonProps: { icon: 'i-lucide-pencil', variant: 'ghost', size: 'xs' }, onClick: ({ row }) => notify(`编辑 ${row.name}`) },
      { key: 'archive', buttonProps: { icon: 'i-lucide-archive', label: '归档', size: 'xs' }, onClick: ({ row }) => notify(`归档 ${row.name}`) },
      { key: 'delete', divider: true, buttonProps: { icon: 'i-lucide-trash-2', label: '删除', color: 'error', size: 'xs' }, onClick: ({ row }) => notify(`删除 ${row.name}`) }
    ]
  }
]
</script>

<template>
  <MDataTable row-key="id" :columns="columns" :data="data" />
</template>
