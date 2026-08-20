<script setup lang="ts">
import type { DataTableColumn, DataTableDataColumn } from '@movk/nuxt'
import type { Person } from '~/composables/useTableMock'

const data = makePeople(6)
const moneyCell: DataTableDataColumn<Person>['cell'] = ({ getValue }) => `¥${getValue<number>().toLocaleString()}`

const columns: DataTableColumn<Person>[] = [
  { accessorKey: 'id', header: '工号', size: 100 },
  { accessorKey: 'name', header: '姓名', size: 140, sortable: true },
  { accessorKey: 'department', header: '部门', size: 120 },
  { accessorKey: 'level', header: '职级', size: 120 },
  { accessorKey: 'salary', header: '薪资', align: 'right', size: 140, cell: moneyCell }
]
</script>

<template>
  <MDataTable :columns="columns" :data="data">
    <template #name-header>
      <span class="inline-flex items-center gap-1 truncate">
        <UIcon name="i-lucide-user-round" class="size-4 text-primary" />
        姓名
      </span>
    </template>

    <template #department-cell="{ row }">
      <UBadge color="neutral" variant="subtle" size="sm">
        {{ row.original.department }}
      </UBadge>
    </template>

    <template #level-cell="{ getValue }">
      <UBadge v-if="getValue()" color="primary" variant="soft" size="sm">
        {{ getValue() }}
      </UBadge>
      <span v-else class="text-muted">未定级</span>
    </template>
  </MDataTable>
</template>
