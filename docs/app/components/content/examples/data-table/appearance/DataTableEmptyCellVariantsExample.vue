<script setup lang="ts">
import type { DataTableColumn, DataTableProps } from '@movk/nuxt'
import type { Person } from '~/composables/useTableMock'
import { UBadge, UIcon } from '#components'

const columns: DataTableColumn<Person>[] = [
  { accessorKey: 'name', header: '姓名', size: 90 },
  { accessorKey: 'address', header: '住址', size: 200 },
  { accessorKey: 'bio', header: '简介', size: 220 }
]
const data: Person[] = makePeople(3).map((p, i) => ({
  ...p,
  bio: i % 2 === 0 ? '' : p.bio,
  address: i % 3 === 0 ? '' : p.address
}))

const vnodeCell: DataTableProps<Person>['emptyCell'] = () =>
  h(UBadge, { color: 'neutral', variant: 'subtle', size: 'sm' }, () => [
    h(UIcon, { name: 'i-lucide-minus', class: 'size-3' }),
    ' 暂无'
  ])
</script>

<template>
  <div class="grid grid-cols-1 lg:grid-cols-3 gap-4">
    <div class="flex flex-col gap-2">
      <span class="text-xs text-muted">字符串占位 (—)</span>
      <MDataTable :data="data" :columns="columns" empty-cell="—" bordered />
    </div>
    <div class="flex flex-col gap-2">
      <span class="text-xs text-muted">函数模板 (VNode)</span>
      <MDataTable :data="data" :columns="columns" :empty-cell="vnodeCell" bordered />
    </div>
    <div class="flex flex-col gap-2">
      <span class="text-xs text-muted">关闭占位 (false)</span>
      <MDataTable :data="data" :columns="columns" :empty-cell="false" bordered />
    </div>
  </div>
</template>
