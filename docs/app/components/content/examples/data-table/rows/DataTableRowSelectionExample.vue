<script setup lang="ts">
import type { DataTableColumn, DataTableSelectHandler, RowSelectionState } from '@movk/nuxt'
import type { Person } from '~/composables/useTableMock'

const data = makePeople(10)
const selection = ref<RowSelectionState>({})
const lastSelected = ref('')

const columns: DataTableColumn<Person>[] = [
  { type: 'selection' },
  { accessorKey: 'name', header: '姓名' },
  { accessorKey: 'department', header: '部门' },
  { accessorKey: 'role', header: '岗位' }
]

const onSelect: DataTableSelectHandler<Person> = (_e, row) => {
  lastSelected.value = row.original.name
}
</script>

<template>
  <div class="flex flex-col gap-2">
    <MDataTable
      v-model:row-selection="selection"
      row-key="id"
      :columns="columns"
      :data="data"
      :ui="{ root: 'max-h-[50vh]' }"
      @select="onSelect"
    />
    <p class="text-xs text-muted">
      最近点击：{{ lastSelected || '（无）' }}
    </p>
    <pre class="text-xs p-3 rounded-md bg-muted overflow-auto">selection: {{ selection }}</pre>
  </div>
</template>
