<script setup lang="ts">
import type { DataTableColumn, DataTableSelectionColumn } from '@movk/nuxt'
import type { Person } from '~/composables/useTableMock'

const treeData = makePeopleTree(3, 3, 2)
const strategy = ref<DataTableSelectionColumn['strategy']>('cascade')

const columns = computed<DataTableColumn<Person>[]>(() => [
  { type: 'selection', strategy: strategy.value },
  { type: 'expand' },
  { accessorKey: 'name', header: '成员' },
  { accessorKey: 'department', header: '部门' },
  { accessorKey: 'role', header: '岗位' }
])
</script>

<template>
  <div class="flex flex-col gap-3">
    <USelect
      v-model="strategy"
      :items="[
        { label: 'cascade 父子级联', value: 'cascade' },
        { label: 'isolated 父子独立', value: 'isolated' },
        { label: 'leaf 仅叶子可勾', value: 'leaf' }
      ]"
      value-key="value"
      size="xs"
      class="w-56"
    />
    <MDataTable :data="treeData" :columns="columns" children-key="children" row-key="id" />
  </div>
</template>
