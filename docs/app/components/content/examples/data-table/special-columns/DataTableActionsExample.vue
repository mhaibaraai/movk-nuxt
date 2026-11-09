<script setup lang="ts">
import type { DataTableActionsColumn, DataTableColumn } from '@movk/nuxt'
import type { Person } from '~/composables/useTableMock'

const data = makePeople(6)
const toast = useToast()
const notify = (title: string): void => {
  toast.add({ title, duration: 1500 })
}

// 函数形态按行派生按钮：研发部额外追加「重置密码」
const actions: DataTableActionsColumn<Person>['actions'] = ({ row: { original } }) => [
  { key: 'view', buttonProps: { icon: 'i-lucide-eye' }, onClick: ({ row }) => notify(`查看 ${row.name}`) },
  {
    key: 'sync',
    buttonProps: { icon: 'i-lucide-refresh-cw' },
    onClick: async ({ row }) => {
      await new Promise(resolve => setTimeout(resolve, 1200))
      notify(`已同步 ${row.name}`)
    }
  },
  {
    key: 'edit',
    buttonProps: { icon: 'i-lucide-pencil', label: '编辑' },
    disabled: ({ row }) => row.status !== 'active',
    onClick: ({ row }) => notify(`编辑 ${row.name}`)
  },
  {
    key: 'recall',
    buttonProps: { icon: 'i-lucide-undo-2', label: '召回' },
    visibility: ({ row }) => row.status === 'offboarded',
    onClick: ({ row }) => notify(`召回 ${row.name}`)
  },
  ...(original.department === '研发'
    ? [{ key: 'reset', divider: true, buttonProps: { icon: 'i-lucide-key-round', label: '重置密码' }, onClick: () => notify(`重置 ${original.name} 的密码`) }]
    : [])
]

const columns: DataTableColumn<Person>[] = [
  { accessorKey: 'name', header: '姓名' },
  { accessorKey: 'department', header: '部门' },
  { accessorKey: 'status', header: '状态' },
  { type: 'actions', maxInline: 3, minSize: 100, actions }
]
</script>

<template>
  <MDataTable row-key="id" :columns="columns" :data="data" />
</template>
