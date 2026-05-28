<script setup lang="ts">
import type { DataTableColumn } from '@movk/nuxt'
import type { Person } from '~/composables/useTableMock'

const data = makePeople(10)

const columns: DataTableColumn<Person>[] = [
  { accessorKey: 'name', header: '姓名' },
  { accessorKey: 'status', header: '状态' },
  { accessorKey: 'salary', header: '薪资', align: 'right', size: 110 }
]

function rowClassByStatus(row: Person): string {
  if (row.status === 'offboarded') return 'bg-gray-50/40 dark:bg-gray-900/10'
  if (row.status === 'leave') return 'bg-warning-50/40 dark:bg-warning-900/10'
  return ''
}
function rowStyleBySalary(row: Person): Record<string, string> {
  if (row.salary >= 40000) return { fontWeight: '600', color: 'var(--ui-color-error-600, #dc2626)' }
  if (row.salary >= 25000) return { fontWeight: '500' }
  return {}
}
</script>

<template>
  <MDataTable
    row-key="id"
    :columns="columns"
    :data="data"
    :row-class="rowClassByStatus"
    :row-style="rowStyleBySalary"
    bordered
    :ui="{ root: 'max-h-[50vh]' }"
  />
</template>
