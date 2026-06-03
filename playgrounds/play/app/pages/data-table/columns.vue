<script setup lang="ts">
import type { DataTableColumn, DataTableDataColumn, DataTableProps } from '@movk/nuxt'
import type { Person } from '../../composables/useMockData'

const data = makePeople(10)

const moneyCell: DataTableDataColumn<Person>['cell'] = ({ getValue }) => `¥${getValue<number>().toLocaleString()}`

// 1. 固定列
const fixedColumns: DataTableColumn<Person>[] = [
  { accessorKey: 'id', header: '工号', fixed: 'left', size: 100 },
  { accessorKey: 'name', header: '姓名', fixed: 'left', size: 120 },
  { accessorKey: 'role', header: '岗位', size: 140 },
  { accessorKey: 'address', header: '地址', size: 240 },
  { accessorKey: 'email', header: '邮箱', size: 200 },
  { accessorKey: 'salary', header: '薪资', fixed: 'right', align: 'right', size: 120, cell: moneyCell }
]

// 2. 排序
const sortableColumns: DataTableColumn<Person>[] = [
  { accessorKey: 'id', header: '工号', size: 100, sortable: false },
  { accessorKey: 'name', header: '姓名', size: 120 },
  { accessorKey: 'level', header: '职级', size: 100 },
  { accessorKey: 'salary', header: '薪资', align: 'right', size: 120, cell: moneyCell }
]

// 3. 列固定切换 pinable
const pinableColumns: DataTableColumn<Person>[] = [
  { accessorKey: 'id', header: '工号', fixed: 'left', size: 100, pinable: false },
  { accessorKey: 'name', header: '姓名', size: 120 },
  { accessorKey: 'department', header: '部门', size: 100 },
  { accessorKey: 'role', header: '岗位', size: 140 },
  { accessorKey: 'salary', header: '薪资', align: 'right', size: 120, cell: moneyCell }
]

// 4. 列宽拖拽 resizable
const resizableColumns: DataTableColumn<Person>[] = [
  { accessorKey: 'id', header: '工号', size: 100 },
  { accessorKey: 'name', header: '姓名', size: 120 },
  { accessorKey: 'level', header: '职级', size: 100, resizable: false },
  { accessorKey: 'address', header: '地址', size: 180 },
  { accessorKey: 'bio', header: '个人简介', size: 200 }
]

// 5. 截断 + tooltip
const truncateColumns: DataTableColumn<Person>[] = [
  { accessorKey: 'name', header: '姓名' },
  { accessorKey: 'bio', header: '个人简介', size: 240, tooltip: 2 },
  { accessorKey: 'address', header: '地址', size: 200, truncate: true },
  { accessorKey: 'department', header: '部门', size: 100, truncate: false }
]

// 6. 可见性控制（白名单 + 黑名单）
const visibilityColumns: DataTableColumn<Person>[] = [
  { accessorKey: 'id', header: '工号', size: 100 },
  { accessorKey: 'name', header: '姓名', size: 120 },
  { accessorKey: 'department', header: '部门', size: 100 },
  { accessorKey: 'role', header: '岗位', size: 140 },
  { accessorKey: 'level', header: '职级', size: 100 },
  { accessorKey: 'email', header: '邮箱', size: 200 },
  { accessorKey: 'joinedAt', header: '入职日期', size: 130, visibility: false },
  { accessorKey: 'salary', header: '薪资', align: 'right', size: 120, cell: moneyCell }
]
const allVisibilityKeys = ['id', 'name', 'department', 'role', 'level', 'email', 'joinedAt', 'salary']
const whitelistKeys = ref<string[]>([])
const excludeKeys = ref<string[]>([])

// 7. 函数式配置
const functionalColumns: DataTableColumn<Person>[] = [
  { accessorKey: 'id', header: '工号', size: 100 },
  { accessorKey: 'name', header: '姓名', size: 120 },
  { accessorKey: 'department', header: '部门', size: 100 },
  { accessorKey: 'bio', header: '个人简介', size: 220 },
  { accessorKey: 'address', header: '地址', size: 180 },
  { accessorKey: 'salary', header: '薪资', align: 'right', size: 120, cell: moneyCell }
]
const sortableFn: DataTableProps<Person>['sortable'] = col => col.accessorKey !== 'id'
const pinableFn: DataTableProps<Person>['pinable'] = col => !['bio', 'address'].includes(col.accessorKey)
const resizableFn: DataTableProps<Person>['resizable'] = col => col.accessorKey !== 'salary'
const truncateFn: DataTableDataColumn<Person>['truncate'] = ctx =>
  ctx.column.id === 'bio' ? (ctx.row.original.bio.length > 45 ? 3 : 2) : true
const tooltipFn: DataTableDataColumn<Person>['tooltip'] = ctx => ctx.column.id === 'address'
const functionalSource = `sortable:  (col) => col.accessorKey !== 'id'
pinable:   (col) => !['bio','address'].includes(col.accessorKey)
resizable: (col) => col.accessorKey !== 'salary'
truncate:  (ctx) => ctx.column.id === 'bio'
              ? (ctx.row.original.bio.length > 45 ? 3 : 2)
              : true
tooltip:   (ctx) => ctx.column.id === 'address'`
</script>

<template>
  <Navbar />

  <div class="p-4 flex flex-col gap-4">
    <Showcase
      title="左右固定列"
      description="column.fixed 把列贴到表格两侧，横向滚动时保持可见"
    >
      <MDataTable
        :columns="fixedColumns"
        :data="data"
        :ui="{ root: 'max-w-2xl' }"
      />
    </Showcase>

    <Showcase
      title="列排序"
      description="全局 sortable 启用所有数据列点击表头排序，列级 sortable 反向覆盖单列"
    >
      <MDataTable
        :columns="sortableColumns"
        :data="data"
        sortable
        bordered
      />
    </Showcase>

    <Showcase
      title="列固定切换"
      description="全局 pinable 让用户点表头图钉在 left、right、none 间循环，列级 pinable 锁住强制位"
    >
      <MDataTable
        :columns="pinableColumns"
        :data="data"
        pinable
        bordered
        :ui="{ root: 'max-w-3xl' }"
      />
    </Showcase>

    <Showcase
      title="列宽拖拽"
      description="全局 resizable 给所有数据列加拖拽手柄，列级 resizable 反向覆盖单列锁宽"
    >
      <MDataTable
        :columns="resizableColumns"
        :data="data"
        resizable
        bordered
      />
    </Showcase>

    <Showcase
      title="文本截断与 tooltip"
      description="truncate 控制纯截断，tooltip 自带相同行数的截断与溢出时浮出完整内容，两者不需同时配置"
    >
      <MDataTable
        :columns="truncateColumns"
        :data="data"
        bordered
        :ui="{ root: 'max-w-3xl' }"
      />
    </Showcase>

    <Showcase
      title="列可见性"
      description="column.visibility 设默认显隐，columnVisibilityKeys 白名单与 columnVisibilityExcludeKeys 黑名单互斥，同传时白名单优先"
    >
      <template #toolbar>
        <USelect
          v-model="whitelistKeys"
          :items="allVisibilityKeys"
          multiple
          size="xs"
          placeholder="勾选白名单"
          class="w-64"
        />
        <USelect
          v-model="excludeKeys"
          :items="allVisibilityKeys"
          multiple
          size="xs"
          placeholder="勾选黑名单"
          class="w-64"
        />
      </template>

      <p class="text-xs text-muted">
        两者互斥；若同时勾选，白名单优先。<code>joinedAt</code> 默认隐藏。
      </p>
      <MDataTable
        :columns="visibilityColumns"
        :data="data"
        bordered
        :column-visibility-keys="whitelistKeys.length ? whitelistKeys : undefined"
        :column-visibility-exclude-keys="excludeKeys.length ? excludeKeys : undefined"
      />
    </Showcase>

    <Showcase
      title="函数式列配置"
      description="sortable、pinable、resizable 接受 (col) => boolean，truncate、tooltip 接受 (ctx) => boolean | number，一次声明替代逐列布尔"
    >
      <template #aside>
        <pre class="text-xs leading-5 p-3 rounded-md bg-muted overflow-auto">{{ functionalSource }}</pre>
      </template>

      <MDataTable
        :columns="functionalColumns"
        :data="data"
        bordered
        :sortable="sortableFn"
        :pinable="pinableFn"
        :resizable="resizableFn"
        :truncate="truncateFn"
        :tooltip="tooltipFn"
      />
    </Showcase>
  </div>
</template>
