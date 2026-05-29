<script setup lang="ts">
import type { DataTableColumn, DataTableTreeSelectionStrategy, RowSelectionState } from '@movk/nuxt'
import type { Person } from '~/composables/useTableMock'

const treeData = makePeopleTree(3, 3)
const cascade = ref<RowSelectionState>({})
const isolated = ref<RowSelectionState>({})
const leaf = ref<RowSelectionState>({})

const treeBase: DataTableColumn<Person>[] = [
  { type: 'expand' },
  { accessorKey: 'name', header: '姓名' },
  { accessorKey: 'department', header: '部门' }
]
function strategyColumns(strategy: DataTableTreeSelectionStrategy): DataTableColumn<Person>[] {
  return [{ type: 'selection', strategy }, ...treeBase]
}
</script>

<template>
  <div class="grid grid-cols-1 md:grid-cols-3 gap-3">
    <div class="flex flex-col gap-2">
      <div class="text-xs text-muted">
        cascade（父子级联）
      </div>
      <MDataTable
        v-model:row-selection="cascade"
        row-key="id"
        children-key="children"
        :columns="strategyColumns('cascade')"
        :data="treeData"
      />
    </div>
    <div class="flex flex-col gap-2">
      <div class="text-xs text-muted">
        isolated（独立勾选）
      </div>
      <MDataTable
        v-model:row-selection="isolated"
        row-key="id"
        children-key="children"
        :columns="strategyColumns('isolated')"
        :data="treeData"
      />
    </div>
    <div class="flex flex-col gap-2">
      <div class="text-xs text-muted">
        leaf（仅叶子）
      </div>
      <MDataTable
        v-model:row-selection="leaf"
        row-key="id"
        children-key="children"
        :columns="strategyColumns('leaf')"
        :data="treeData"
      />
    </div>
  </div>
</template>
