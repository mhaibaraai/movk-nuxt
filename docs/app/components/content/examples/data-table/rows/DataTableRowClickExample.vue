<script setup lang="ts">
import type { DataTableColumn, ExpandedState, RowSelectionState } from '@movk/nuxt'
import type { Person } from '~/composables/useTableMock'

const data = makePeople(8)
const selection = ref<RowSelectionState>({})
const expanded = ref<ExpandedState>({})
const selectOnRowClick = ref(true)
const expandOnRowClick = ref(false)

const columns: DataTableColumn<Person>[] = [
  { type: 'selection' },
  { type: 'expand' },
  { accessorKey: 'name', header: '姓名' },
  { accessorKey: 'department', header: '部门', size: 90 }
]
</script>

<template>
  <div class="flex flex-col gap-3">
    <div class="flex flex-wrap gap-3">
      <USwitch v-model="selectOnRowClick" label="selectOnRowClick" />
      <USwitch v-model="expandOnRowClick" label="expandOnRowClick" />
    </div>
    <MDataTable
      v-model:row-selection="selection"
      v-model:expanded="expanded"
      row-key="id"
      :columns="columns"
      :data="data"
      :select-on-row-click="selectOnRowClick"
      :expand-on-row-click="expandOnRowClick"
      bordered
      :ui="{ root: 'max-h-[50vh]' }"
    >
      <template #expanded="{ row }">
        <div class="px-4 py-2 text-xs text-muted bg-elevated/30">
          {{ row.original.bio }}
        </div>
      </template>
    </MDataTable>
  </div>
</template>
