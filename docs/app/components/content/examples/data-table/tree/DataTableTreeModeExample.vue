<script setup lang="ts">
import type { DataTableColumn, DataTableSelectionColumn } from '@movk/nuxt'
import type { Person } from '~/composables/useTableMock'

const treeData = makePeopleTree(3, 3, 2)
const mode = ref<DataTableSelectionColumn['mode']>('multiple')

const columns = computed<DataTableColumn<Person>[]>(() => [
  { type: 'selection', mode: mode.value, strategy: mode.value === 'single' ? 'isolated' : 'cascade' },
  { type: 'expand' },
  { accessorKey: 'name', header: '成员' },
  { accessorKey: 'department', header: '部门' },
  { accessorKey: 'role', header: '岗位' }
])
</script>

<template>
  <div class="flex flex-col gap-3">
    <USwitch
      :model-value="mode === 'single'"
      label="single 单选"
      @update:model-value="mode = $event ? 'single' : 'multiple'"
    />
    <MDataTable :data="treeData" :columns="columns" children-key="children" row-key="id" />
  </div>
</template>
