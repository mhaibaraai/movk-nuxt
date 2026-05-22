<script setup lang="ts">
import type { DataTableColumn, DataTableExposed } from '@movk/nuxt'
import type { Person } from '~/composables/useTableMock'

const treeData = makePeopleTree(3, 3, 2)
const tableRef = useTemplateRef<DataTableExposed<Person>>('tableRef')
const selectionKeys = ref<string[]>([])
const names = (rows: Person[]) => rows.map(p => p.name)

const result = computed(() => {
  const r = tableRef.value?.treeSelection
  if (!r) return {}
  return {
    leaves: names(r.leaves),
    parents: names(r.parents),
    halfSelected: names(r.halfSelected),
    strictlyChecked: names(r.strictlyChecked)
  }
})

const columns: DataTableColumn<Person>[] = [
  { type: 'selection', strategy: 'cascade' },
  { type: 'expand' },
  { accessorKey: 'name', header: '成员', size: 200 },
  { accessorKey: 'department', header: '部门' }
]
</script>

<template>
  <div class="flex flex-col gap-3">
    <UButton size="xs" variant="soft" class="self-start" @click="tableRef?.clearSelection()">
      清空选中
    </UButton>
    <MDataTable
      ref="tableRef"
      v-model:row-selection-keys="selectionKeys"
      :data="treeData"
      :columns="columns"
      children-key="children"
      row-key="id"
      bordered
    />
    <pre class="text-xs p-3 rounded-md bg-muted overflow-auto">{{ result }}</pre>
  </div>
</template>
