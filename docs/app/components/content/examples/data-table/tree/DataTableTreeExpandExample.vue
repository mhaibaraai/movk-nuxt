<script setup lang="ts">
import type { DataTableColumn, DataTableExposed } from '@movk/nuxt'
import type { Person } from '~/composables/useTableMock'

const treeData = makePeopleTree(3, 3, 3)
const tableRef = useTemplateRef<DataTableExposed<Person>>('tableRef')
const expandOnRowClick = ref(false)

const columns: DataTableColumn<Person>[] = [
  {
    type: 'expand',
    buttonProps: ctx => ({
      icon: ctx.isExpanded ? 'i-lucide-folder-open' : 'i-lucide-folder',
      color: ctx.isExpanded ? 'primary' : 'neutral',
      variant: 'soft'
    }),
    toggleAllButtonProps: ctx => ({
      icon: ctx.isAllExpanded ? 'i-lucide-chevrons-down-up' : 'i-lucide-chevrons-up-down',
      variant: 'soft',
      color: 'primary'
    })
  },
  { accessorKey: 'name', header: '成员' },
  { accessorKey: 'department', header: '部门' },
  { accessorKey: 'role', header: '岗位' }
]
</script>

<template>
  <div class="flex flex-col gap-3">
    <div class="flex flex-wrap items-center gap-2">
      <USwitch v-model="expandOnRowClick" label="expandOnRowClick" />
      <UButton size="xs" variant="soft" @click="tableRef?.expandToDepth(1)">
        展开 1 级
      </UButton>
      <UButton size="xs" variant="soft" @click="tableRef?.expandToDepth(2)">
        展开 2 级
      </UButton>
      <UButton size="xs" variant="soft" @click="tableRef?.collapseAll()">
        收起全部
      </UButton>
    </div>
    <MDataTable
      ref="tableRef"
      :data="treeData"
      :columns="columns"
      children-key="children"
      row-key="id"
      :expand-on-row-click="expandOnRowClick"
    />
  </div>
</template>
