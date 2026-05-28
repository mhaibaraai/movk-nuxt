<script setup lang="ts">
import type { DataTableColumn, DataTableDataColumn, PaginationState } from '@movk/nuxt'
import type { Person } from '~/composables/useTableMock'
import { UBadge } from '#components'

const data = makePeople(40)
const pagination = ref<PaginationState>({ pageIndex: 0, pageSize: 6 })
const toast = useToast()
const notify = (msg: string): void => { toast.add({ title: msg, duration: 1500 }) }

const STATUS_LABEL: Record<Person['status'], string> = {
  active: '在职',
  leave: '休假',
  offboarded: '已离职'
}
const STATUS_COLOR: Record<Person['status'], 'success' | 'warning' | 'neutral'> = {
  active: 'success',
  leave: 'warning',
  offboarded: 'neutral'
}

const statusCell: DataTableDataColumn<Person>['cell'] = ({ getValue }) => {
  const v = getValue<Person['status']>()
  return h(UBadge, { color: STATUS_COLOR[v], variant: 'subtle' }, () => STATUS_LABEL[v])
}
const moneyCell: DataTableDataColumn<Person>['cell'] = ({ getValue }) => `¥${getValue<number>().toLocaleString()}`

const columns: DataTableColumn<Person>[] = [
  { type: 'selection' },
  { type: 'index' },
  { accessorKey: 'name', header: '姓名', size: 120, fixed: 'left', pinable: true },
  { accessorKey: 'department', header: '部门', size: 100 },
  { accessorKey: 'role', header: '岗位', size: 160, resizable: true },
  { accessorKey: 'status', header: '状态', size: 100, cell: statusCell },
  { accessorKey: 'salary', header: '薪资', size: 120, align: 'right', cell: moneyCell },
  {
    type: 'actions',
    size: 100,
    maxInline: 2,
    actions: [
      { key: 'edit', buttonProps: { icon: 'i-lucide-pencil', variant: 'ghost', size: 'xs' }, onClick: ({ row }) => notify(`编辑 ${row.name}`) },
      { key: 'delete', buttonProps: { icon: 'i-lucide-trash-2', variant: 'ghost', color: 'error', size: 'xs' }, onClick: ({ row }) => notify(`删除 ${row.name}`) }
    ]
  }
]
</script>

<template>
  <MDataTable
    v-model:pagination="pagination"
    row-key="id"
    :columns="columns"
    :data="data"
    sortable
    bordered
  />
</template>
