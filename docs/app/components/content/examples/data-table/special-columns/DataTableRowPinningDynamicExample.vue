<script setup lang="ts">
import type { DataTableColumn } from '@movk/nuxt'
import type { Person } from '~/composables/useTableMock'

const data = makePeople(6)

const columns: DataTableColumn<Person>[] = [
  {
    type: 'row-pinning',
    buttonProps: ({ pinned }) => pinned
      ? { icon: 'i-lucide-pin-off', color: 'primary', variant: 'soft' }
      : { icon: 'i-lucide-pin', color: 'neutral', variant: 'ghost' }
  },
  { accessorKey: 'name', header: '姓名', size: 110 },
  { accessorKey: 'department', header: '部门', size: 90 },
  { accessorKey: 'role', header: '岗位', size: 120 }
]
</script>

<template>
  <MDataTable row-key="id" :columns="columns" :data="data" bordered />
</template>
