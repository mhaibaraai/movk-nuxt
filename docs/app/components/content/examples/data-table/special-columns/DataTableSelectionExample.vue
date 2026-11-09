<script setup lang="ts">
import type { DataTableColumn, DataTableProps, DataTableSelectionColumn, RowSelectionState } from '@movk/nuxt'
import type { Person } from '~/composables/useTableMock'

const props = withDefaults(defineProps<{
  mode?: 'multiple' | 'single'
}>(), { mode: 'multiple' })

const data = makePeople(6)
const selection = ref<RowSelectionState>({})

// 离职员工不可选：enableRowSelection 约束选择逻辑，checkboxProps 同步禁用复选框
const options: DataTableProps<Person>['options'] = {
  enableRowSelection: row => row.original.status !== 'offboarded'
}
const checkboxProps: DataTableSelectionColumn<Person>['checkboxProps'] = ctx =>
  ctx.scope === 'cell' ? { disabled: !ctx.cellContext.row.getCanSelect() } : {}

const columns = computed<DataTableColumn<Person>[]>(() => [
  { type: 'selection', mode: props.mode, header: props.mode === 'single' ? '选择' : undefined, checkboxProps },
  { accessorKey: 'name', header: '姓名' },
  { accessorKey: 'department', header: '部门' },
  { accessorKey: 'status', header: '状态' }
])
</script>

<template>
  <div class="flex flex-col gap-3">
    <MDataTable
      :key="props.mode"
      v-model:row-selection="selection"
      row-key="id"
      :columns="columns"
      :data="data"
      :options="options"
    />
    <pre class="text-xs p-3 rounded-md bg-tint overflow-auto">rowSelection: {{ selection }}</pre>
  </div>
</template>
