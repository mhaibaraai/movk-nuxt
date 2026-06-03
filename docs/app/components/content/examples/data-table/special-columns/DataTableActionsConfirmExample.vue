<script setup lang="ts">
import type { DataTableColumn } from '@movk/nuxt'
import type { Person } from '~/composables/useTableMock'

const data = makePeople(5)
const toast = useToast()
const notify = (msg: string): void => { toast.add({ title: msg, duration: 1500 }) }

const columns: DataTableColumn<Person>[] = [
  { accessorKey: 'name', header: '姓名' },
  { accessorKey: 'status', header: '状态' },
  {
    type: 'actions',
    size: 120,
    actions: [
      { key: 'edit', buttonProps: { icon: 'i-lucide-pencil', variant: 'ghost', size: 'xs' }, onClick: ({ row }) => notify(`编辑 ${row.name}`) },
      {
        key: 'delete',
        buttonProps: { icon: 'i-lucide-trash-2', label: '删除', color: 'error', size: 'xs' },
        confirm: true,
        confirmProps: ({ row }) => ({
          type: row.status === 'active' ? 'warning' : 'error',
          title: `删除 ${row.name}？`,
          description: row.status === 'active' ? '该员工在职，删除前请二次确认。' : '已离职员工删除后无法恢复。',
          confirmText: '我已确认'
        }),
        onClick: ({ row }) => notify(`已删除 ${row.name}`)
      }
    ]
  }
]
</script>

<template>
  <MDataTable row-key="id" :columns="columns" :data="data" />
</template>
