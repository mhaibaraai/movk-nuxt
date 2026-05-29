<script setup lang="ts">
import type { DataTableColumn, DataTableProps } from '@movk/nuxt'
import type { Person } from '~/composables/useTableMock'
import { UBadge, UIcon } from '#components'

const vnodeCell: DataTableProps<Person>['emptyCell'] = () =>
  h(UBadge, { color: 'neutral', variant: 'subtle', size: 'sm' }, () => [
    h(UIcon, { name: 'i-lucide-minus', class: 'size-3' }),
    ' 暂无'
  ])

const columns: DataTableColumn<Person>[] = [
  { accessorKey: 'name', header: '姓名' },
  { accessorKey: 'address', header: '住址', size: 200 },
  { accessorKey: 'bio', header: '简介', size: 220, emptyCell: vnodeCell }
]

const data: Person[] = makePeople(3).map((p, i) => ({
  ...p,
  bio: i % 2 === 0 ? '' : p.bio,
  address: i % 3 === 0 ? '' : p.address
}))
</script>

<template>
  <MDataTable :data="data" :columns="columns" />
</template>
