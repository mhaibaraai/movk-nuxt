<script setup lang="ts">
import type { DataTableColumn } from '#movk/types/data-table/columns'
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

const styleData = makePeople(8)
const styleColumns = usePeopleColumns()

const stripe = ref(true)
const bordered = ref(true)
const density = ref<'compact' | 'normal' | 'comfortable'>('normal')
const truncate = ref(true)
</script>

<template>
  <Navbar />

  <div class="p-4 flex flex-col gap-6">
    <Showcase
      title="树形数据与级联选择"
      description="childrenKey 识别层级，selection cascade 同步父子选中，expand 列控制展开"
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
      title="视觉密度与截断"
      description="切换斑马纹、边框、密度与 tooltip 截断，UI props 即时影响表格呈现"
    >
      <template #toolbar>
        <USwitch v-model="stripe" label="斑马纹" />
        <USwitch v-model="bordered" label="纵向边框" />
        <USwitch v-model="truncate" label="单行截断" />
        <USelect v-model="density" :items="['compact', 'normal', 'comfortable']" size="xs" class="w-32" />
      </template>

      <MDataTable
        :data="styleData"
        :columns="styleColumns"
        :stripe="stripe"
        :bordered="bordered"
        :density="density"
        :truncate="truncate"
        :tooltip="truncate"
        empty-cell="—"
        :ui="{ root: 'max-h-[50vh]' }"
      />
    </Showcase>
  </div>
</template>
