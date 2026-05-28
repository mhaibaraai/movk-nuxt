<script setup lang="ts">
import type { DataTableColumn, DataTableExposed } from '@movk/nuxt'
import type { Person } from '~/composables/useTableMock'

const treeData = makePeopleTree(3, 3)
const selectionKeys = ref<string[]>([])
const tableRef = useTemplateRef<DataTableExposed<Person>>('tableRef')

const derived = computed(() => {
  const r = tableRef.value?.treeSelection
  return {
    leaves: r?.leaves.map(p => p.name) ?? [],
    parents: r?.parents.map(p => p.name) ?? [],
    halfSelected: r?.halfSelected.map(p => p.name) ?? []
  }
})

const columns: DataTableColumn<Person>[] = [
  { type: 'selection' },
  { type: 'expand' },
  { accessorKey: 'name', header: '姓名', size: 160 },
  { accessorKey: 'department', header: '部门', size: 90 }
]
</script>

<template>
  <div class="flex flex-col gap-3">
    <MDataTable
      ref="tableRef"
      v-model:row-selection-keys="selectionKeys"
      row-key="id"
      children-key="children"
      :columns="columns"
      :data="treeData"
    />
    <pre class="text-xs p-3 rounded-md bg-muted overflow-auto">treeSelection: {{ derived }}</pre>
  </div>
</template>
