<script setup lang="ts">
import type { DataTableAction, DataTableActionsColumn, DataTableColumn } from '@movk/nuxt'
import type { Person } from '~/composables/useTableMock'

const data = makePeople(5)
const toast = useToast()
const notify = (msg: string): void => { toast.add({ title: msg, duration: 1500 }) }

const base: DataTableAction<Person>[] = [
  { key: 'view', buttonProps: { icon: 'i-lucide-eye', variant: 'ghost', size: 'xs' }, onClick: ({ row }) => notify(`查看 ${row.name}`) },
  { key: 'edit', buttonProps: { icon: 'i-lucide-pencil', variant: 'ghost', size: 'xs' }, onClick: ({ row }) => notify(`编辑 ${row.name}`) }
]

const actions: DataTableActionsColumn<Person>['actions'] = ({ row: { original } }) => {
  const extras: DataTableAction<Person>[] = []
  if (original.department === '研发')
    extras.push({ key: 'resetPwd', buttonProps: { icon: 'i-lucide-key-round', variant: 'ghost', size: 'xs' }, onClick: ({ row }) => notify(`重置密码 ${row.name}`) })
  if (original.department === '设计')
    extras.push({ key: 'transfer', buttonProps: { icon: 'i-lucide-share-2', variant: 'ghost', size: 'xs' }, onClick: ({ row }) => notify(`转交 ${row.name}`) })
  return [...base, ...extras]
}

const columns: DataTableColumn<Person>[] = [
  { accessorKey: 'name', header: '姓名' },
  { accessorKey: 'department', header: '部门' },
  { type: 'actions', maxInline: 4, actions, size: 120 }
]
</script>

<template>
  <MDataTable row-key="id" :columns="columns" :data="data" />
</template>
