<script setup lang="ts">
import type { DataTableColumn, DataTableProps } from '@movk/nuxt'
import type { Person } from '~/composables/useTableMock'

const treeData = makePeopleTree(3, 3, 3)
const indentMode = ref<'default' | 'number' | 'string' | 'fn'>('default')

const indentSize = computed<DataTableProps<Person>['indentSize']>(() => {
  if (indentMode.value === 'default') return '1rem'
  if (indentMode.value === 'number') return 36
  if (indentMode.value === 'string') return '2.5rem'
  return ctx => `${(ctx.row.depth + 1) * 1.25}rem`
})

function collectParentIds(rows: Person[], acc: string[] = []): string[] {
  for (const row of rows) {
    if (row.children?.length) {
      acc.push(row.id)
      collectParentIds(row.children, acc)
    }
  }
  return acc
}
const expandedKeys = ref<string[]>(collectParentIds(treeData))

const columns: DataTableColumn<Person>[] = [
  { type: 'expand' },
  { accessorKey: 'name', header: '成员', size: 200 },
  { accessorKey: 'department', header: '部门' },
  { accessorKey: 'role', header: '岗位' }
]
</script>

<template>
  <div class="flex flex-col gap-3">
    <USelect
      v-model="indentMode"
      :items="[
        { label: '默认 1rem', value: 'default' },
        { label: '数字 36 (px)', value: 'number' },
        { label: '字符串 2.5rem', value: 'string' },
        { label: '函数按层级', value: 'fn' }
      ]"
      value-key="value"
      size="xs"
      class="w-56"
    />
    <MDataTable
      v-model:expanded-keys="expandedKeys"
      :data="treeData"
      :columns="columns"
      children-key="children"
      row-key="id"
      :indent-size="indentSize"
      bordered
    />
  </div>
</template>
