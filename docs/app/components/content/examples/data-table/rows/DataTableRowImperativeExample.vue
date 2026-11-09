<script setup lang="ts">
import type { DataTableColumn, DataTableExposed, RowSelectionState } from '@movk/nuxt'
import type { Person } from '~/composables/useTableMock'

const data = makePeople(15)
const tableRef = useTemplateRef<DataTableExposed<Person>>('tableRef')
const selection = ref<RowSelectionState>({})
const selectedRows = ref<Person[]>([])

const columns: DataTableColumn<Person>[] = [
  { type: 'selection' },
  { type: 'expand' },
  { accessorKey: 'name', header: '姓名' },
  { accessorKey: 'department', header: '部门' },
  { accessorKey: 'role', header: '岗位' }
]
</script>

<template>
  <div class="flex flex-col gap-3">
    <div class="flex flex-wrap gap-2">
      <UButton size="xs" variant="soft" @click="tableRef?.selectAll()">
        全部选中
      </UButton>
      <UButton size="xs" variant="soft" @click="selectedRows = tableRef?.getSelectedRows() ?? []">
        读取已选数据
      </UButton>
      <UButton size="xs" variant="soft" @click="tableRef?.expandAll()">
        展开全部详情
      </UButton>
      <UButton size="xs" variant="soft" @click="tableRef?.collapseAll()">
        收起全部详情
      </UButton>
      <UButton size="xs" variant="soft" icon="i-lucide-eraser" @click="tableRef?.clearSelection()">
        清空选中
      </UButton>
      <UButton size="xs" variant="soft" icon="i-lucide-arrow-up-to-line" @click="tableRef?.scrollToTop({ behavior: 'smooth' })">
        回到顶部
      </UButton>
    </div>
    <MDataTable
      ref="tableRef"
      v-model:row-selection="selection"
      row-key="id"
      :columns="columns"
      :data="data"
      select-on-row-click
      :ui="{ root: 'max-h-[40vh]' }"
    >
      <template #expanded="{ row }">
        <p class="p-3 text-sm text-muted">
          {{ row.original.bio }}
        </p>
      </template>
    </MDataTable>
    <pre class="text-xs p-3 rounded bg-muted overflow-auto">{{ selectedRows.map(row => ({ id: row.id, name: row.name })) }}</pre>
  </div>
</template>
