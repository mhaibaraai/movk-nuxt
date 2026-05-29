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
    maxInline: 2,
    size: 120,
    actions: [
      { key: 'view', buttonProps: { icon: 'i-lucide-eye', variant: 'ghost', size: 'xs' }, onClick: ({ row }) => notify(`查看 ${row.name}`) },
      {
        key: 'sync',
        buttonProps: { icon: 'i-lucide-refresh-cw', label: '同步', size: 'xs' },
        onClick: async ({ row }) => {
          await new Promise(r => setTimeout(r, 1200))
          notify(`同步完成 ${row.name}`)
        }
      }
    ]
  }
]
</script>

<template>
  <MDataTable row-key="id" :columns="columns" :data="data" />
</template>
