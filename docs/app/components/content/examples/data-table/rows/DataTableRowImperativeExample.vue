<script setup lang="ts">
import type { DataTableColumn, DataTableExposed, RowSelectionState } from '@movk/nuxt'
import type { Person } from '~/composables/useTableMock'

const data = makePeople(15)
const tableRef = useTemplateRef<DataTableExposed<Person>>('tableRef')
const selection = ref<RowSelectionState>({})

const columns: DataTableColumn<Person>[] = [
  { type: 'selection' },
  { accessorKey: 'name', header: '姓名' },
  { accessorKey: 'department', header: '部门' },
  { accessorKey: 'role', header: '岗位' }
]
</script>

<template>
  <div class="flex flex-col gap-3">
    <div class="flex flex-wrap gap-2">
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
    />
  </div>
</template>
