<script setup lang="ts">
import type { DataTableColumn } from '#movk/types/data-table/columns'
import type { Person } from '../../composables/useMockData'

const data = makePeople(20)

const columns: DataTableColumn<Person>[] = [
  { accessorKey: 'id', header: '工号', fixed: 'left', size: 100, sortable: true },
  { accessorKey: 'name', header: '姓名', fixed: 'left', size: 120, sortable: true, pinable: true },
  {
    header: '工作信息',
    children: [
      { accessorKey: 'department', header: '部门', size: 100 },
      { accessorKey: 'role', header: '岗位', size: 160, resizable: true },
      { accessorKey: 'level', header: '职级', size: 80, sortable: true }
    ]
  },
  {
    header: '联系与时间',
    children: [
      { accessorKey: 'email', header: '邮箱', size: 220, truncate: true, tooltip: true },
      { accessorKey: 'joinedAt', header: '入职日期', size: 130, sortable: true }
    ]
  },
  {
    accessorKey: 'salary',
    header: '薪资',
    align: 'right',
    fixed: 'right',
    size: 120,
    sortable: true,
    cell: ({ getValue }) => `¥${getValue<number>().toLocaleString()}`
  }
]

const visibilityKeys = ref<string[]>([])
const allKeys = ['id', 'name', 'department', 'role', 'level', 'email', 'joinedAt', 'salary']
</script>

<template>
  <Navbar />

  <div class="p-4 flex flex-col gap-4">
    <Showcase
      title="列能力一页通"
      description="accessorKey · header · 分组列 · fixed · size · cell 渲染 · sortable · pinable · resizable · truncate · tooltip · columnVisibility"
    >
      <template #toolbar>
        <USelect
          v-model="visibilityKeys"
          :items="allKeys"
          multiple
          size="xs"
          placeholder="可见列白名单（空=全部）"
          class="w-72"
        />
      </template>

      <MDataTable
        :columns="columns"
        :data="data"
        :column-visibility-keys="visibilityKeys.length ? visibilityKeys : undefined"
        sortable
        pinable
        resizable
        bordered
        sticky
        :ui="{ root: 'max-h-[60vh]' }"
      />
    </Showcase>
  </div>
</template>
