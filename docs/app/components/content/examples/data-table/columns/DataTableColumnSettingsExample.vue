<script setup lang="ts">
import type { DataTableColumn, DataTableExposed } from '@movk/nuxt'
import type { Person } from '~/composables/useTableMock'

const table = useTemplateRef<DataTableExposed<Person>>('table')

const data = makePeople(6)
const columnOrder = ref<string[]>([])

const columns: DataTableColumn<Person>[] = [
  { type: 'selection' },
  { accessorKey: 'id', header: '工号' },
  { accessorKey: 'name', header: '姓名' },
  { accessorKey: 'department', header: '部门' },
  { accessorKey: 'role', header: '岗位' },
  { accessorKey: 'email', header: '邮箱', visibility: false },
  { accessorKey: 'joinedAt', header: '入职日期', visibility: false }
]
</script>

<template>
  <div class="flex flex-col gap-3">
    <div class="flex gap-2">
      <UButton size="xs" variant="outline" @click="table?.resetColumns()">
        重置列设置
      </UButton>
      <UButton size="xs" variant="outline" @click="table?.exportCsv({ filename: 'people.csv' })">
        导出 CSV
      </UButton>
    </div>
    <MDataTable
      ref="table"
      v-model:column-order="columnOrder"
      row-key="id"
      :columns="columns"
      :data="data"
      column-settings
      persist-key="docs-column-settings"
    />
    <pre class="text-xs p-3 rounded-md bg-tint overflow-auto">columnOrder: {{ columnOrder }}</pre>
  </div>
</template>
