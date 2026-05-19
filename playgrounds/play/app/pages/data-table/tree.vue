<script setup lang="ts">
import type { DataTableColumn, DataTableProps } from '@movk/nuxt'
import type { Person } from '../../composables/useMockData'

const treeData = makePeopleTree(4, 4)

const treeColumns: DataTableColumn<Person>[] = [
  { type: 'selection', strategy: 'cascade' },
  { type: 'expand' },
  { accessorKey: 'name', header: '成员', size: 200 },
  { accessorKey: 'department', header: '部门' },
  { accessorKey: 'role', header: '岗位' },
  {
    accessorKey: 'level',
    header: '职级',
    cell: ({ getValue, row }) => `${getValue<string>()}${row.getCanExpand() ? ' (Lead)' : ''}`,
    emptyCell: '—'
  }
]

const indentMode = ref<'default' | 'number' | 'string' | 'fn'>('default')
const indentSize = computed<DataTableProps<Person>['indentSize']>(() => {
  if (indentMode.value === 'default') return '1rem'
  if (indentMode.value === 'number') return 36
  if (indentMode.value === 'string') return '2.5rem'
  return ctx => `${(ctx.row.depth + 1) * 1.25}rem`
})

const expandOnRowClick = ref(false)
const expandedKeys = ref<string[]>([])
const expandColumns: DataTableColumn<Person>[] = [
  { type: 'expand' },
  { accessorKey: 'name', header: '成员', size: 200 },
  { accessorKey: 'department', header: '部门' },
  { accessorKey: 'role', header: '岗位' }
]
</script>

<template>
  <Navbar />

  <div class="p-4 flex flex-col gap-6">
    <Showcase
      title="树形数据与级联选择"
      description="childrenKey 识别层级、selection cascade 同步父子选中、expand 列控制展开"
    >
      <MDataTable
        :data="treeData"
        :columns="treeColumns"
        children-key="children"
        row-key="id"
        bordered
        :ui="{ root: 'max-h-[50vh]' }"
      />
    </Showcase>

    <Showcase
      title="树形缩进"
      description="indentSize 支持字符串、数字与函数形态，函数形态可按 row.depth 等上下文动态调整"
    >
      <template #toolbar>
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
      </template>

      <MDataTable
        :data="treeData"
        :columns="expandColumns"
        children-key="children"
        row-key="id"
        :indent-size="indentSize"
        bordered
      />
    </Showcase>

    <Showcase
      title="行点击展开与受控展开键"
      description="expandOnRowClick 整行响应展开、v-model:expandedKeys 以数组形式双向同步展开行 id"
      :state="{ expandedKeys }"
    >
      <template #toolbar>
        <USwitch v-model="expandOnRowClick" label="expandOnRowClick" />
        <UButton size="xs" variant="soft" @click="expandedKeys = []">
          收起全部
        </UButton>
      </template>

      <MDataTable
        v-model:expanded-keys="expandedKeys"
        :data="treeData"
        :columns="expandColumns"
        children-key="children"
        row-key="id"
        :expand-on-row-click="expandOnRowClick"
        bordered
      />
    </Showcase>
  </div>
</template>
